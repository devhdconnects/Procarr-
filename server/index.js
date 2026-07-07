// server/index.js
import express from 'express';
import cors from 'cors';
import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const requiredEnv = ['RESEND_API_KEY', 'FROM_EMAIL', 'TO_EMAIL'];
const missingEnv = requiredEnv.filter(key => !process.env[key]);

if (missingEnv.length > 0) {
  throw new Error(`Variables serveur manquantes: ${missingEnv.join(', ')}`);
}

const app = express();
const PORT = Number(process.env.PORT || 3001);
const resend = new Resend(process.env.RESEND_API_KEY);

const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

const recipients = process.env.TO_EMAIL.split(',')
  .map(email => email.trim())
  .filter(Boolean);

const requestHits = new Map();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origine CORS non autorisee: ${origin}`));
    },
  }),
);
app.use(express.json({ limit: '50kb' }));

function trimValue(value, maxLength = 2000) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function validateLead(body = {}, type) {
  const data = {
    name: trimValue(body.name, 80),
    email: trimValue(body.email, 120).toLowerCase(),
    phone: trimValue(body.phone, 30),
    subject: trimValue(body.subject, 120),
    city: trimValue(body.city, 80),
    projectType: trimValue(body.projectType, 80),
    budget: trimValue(body.budget, 80),
    message: trimValue(body.message, 2500),
    website: trimValue(body.website, 200),
  };

  const errors = {};
  if (!data.name) errors.name = 'Nom requis';
  if (!data.email) errors.email = 'Email requis';
  if (data.email && !EMAIL_RE.test(data.email)) errors.email = 'Email invalide';
  if (!data.message) {
    errors.message =
      type === 'devis' ? 'Description du projet requise' : 'Message requis';
  }

  return { data, errors };
}

function rateLimit(req, res, next) {
  const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
  const now = Date.now();
  const current = requestHits.get(ip) || { count: 0, resetAt: now + WINDOW_MS };

  if (current.resetAt < now) {
    current.count = 0;
    current.resetAt = now + WINDOW_MS;
  }

  current.count += 1;
  requestHits.set(ip, current);

  if (current.count > MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({ ok: false, error: 'rate_limited' });
  }

  next();
}

async function sendLeadEmail(type, data) {
  const isDevis = type === 'devis';
  const subject = isDevis
    ? `Nouveau devis Procarré - ${data.name}`
    : data.subject
      ? `Contact Procarré - ${data.subject}`
      : `Nouveau message contact - ${data.name}`;

  const text = isDevis
    ? `
NOUVELLE DEMANDE DE DEVIS

Nom: ${data.name}
Email: ${data.email}
Telephone: ${data.phone || '-'}
Ville: ${data.city || '-'}
Type de projet: ${data.projectType || '-'}
Budget: ${data.budget || '-'}

Message:
${data.message}
      `.trim()
    : `
NOUVEAU MESSAGE CONTACT

Nom: ${data.name}
Email: ${data.email}
Telephone: ${data.phone || '-'}
Objet: ${data.subject || '-'}

Message:
${data.message}
      `.trim();

  const { data: resendData, error } = await resend.emails.send({
    from: process.env.FROM_EMAIL,
    to: recipients,
    replyTo: data.email,
    subject,
    text,
  });

  if (error) {
    const message = error.message || JSON.stringify(error);
    throw new Error(`Resend error: ${message}`);
  }

  return resendData;
}

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Procarré API' });
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.post('/api/devis', rateLimit, async (req, res) => {
  const { data, errors } = validateLead(req.body, 'devis');

  if (data.website) {
    return res.status(200).json({ ok: true });
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ ok: false, errors });
  }

  try {
    const result = await sendLeadEmail('devis', data);
    console.log('Email devis envoye:', result?.id || 'sans id');
    return res.status(200).json({ ok: true, id: result?.id });
  } catch (err) {
    console.error('Erreur envoi email devis:', err);
    return res.status(500).json({ ok: false, error: 'email_failed' });
  }
});

app.post('/api/contact', rateLimit, async (req, res) => {
  const { data, errors } = validateLead(req.body, 'contact');

  if (data.website) {
    return res.status(200).json({ ok: true });
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ ok: false, errors });
  }

  try {
    const result = await sendLeadEmail('contact', data);
    console.log('Email contact envoye:', result?.id || 'sans id');
    return res.status(200).json({ ok: true, id: result?.id });
  } catch (err) {
    console.error('Erreur envoi email contact:', err);
    return res.status(500).json({ ok: false, error: 'email_failed' });
  }
});

app.listen(PORT, () => {
  console.log(`API Procarré en écoute sur http://localhost:${PORT}`);
  console.log(`Origines CORS autorisées: ${allowedOrigins.join(', ')}`);
});
