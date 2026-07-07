const requiredEnv = ['RESEND_API_KEY', 'FROM_EMAIL', 'TO_EMAIL'];
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const requestHits = new Map();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;

function json(res, status, body) {
  res.status(status).json(body);
}

function getClientIp(req) {
  const forwardedFor = req.headers['x-forwarded-for'];

  if (typeof forwardedFor === 'string' && forwardedFor.trim()) {
    return forwardedFor.split(',')[0].trim();
  }

  return req.socket?.remoteAddress || 'unknown';
}

function isAllowedOrigin(origin) {
  if (!origin) return true;

  const allowedOrigins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map(value => value.trim())
    .filter(Boolean);

  return allowedOrigins.length === 0 || allowedOrigins.includes(origin);
}

export function applyCors(req, res) {
  const origin = req.headers.origin;

  if (isAllowedOrigin(origin)) {
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
    }
  }

  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    json(res, 204, {});
    return true;
  }

  if (!isAllowedOrigin(origin)) {
    json(res, 403, { ok: false, error: 'origin_not_allowed' });
    return true;
  }

  return false;
}

function assertEnv() {
  const missingEnv = requiredEnv.filter(key => !process.env[key]);

  if (missingEnv.length > 0) {
    throw new Error(`Variables serveur manquantes: ${missingEnv.join(', ')}`);
  }
}

function checkRateLimit(req) {
  const ip = getClientIp(req);
  const now = Date.now();
  const current = requestHits.get(ip) || { count: 0, resetAt: now + WINDOW_MS };

  if (current.resetAt < now) {
    current.count = 0;
    current.resetAt = now + WINDOW_MS;
  }

  current.count += 1;
  requestHits.set(ip, current);

  return current.count <= MAX_REQUESTS_PER_WINDOW;
}

function trimValue(value, maxLength = 2000) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function getBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }

  return req.body;
}

function validateLead(body, type) {
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

function buildEmail(type, data) {
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

  return { subject, text };
}

async function sendWithResend(type, data) {
  const recipients = process.env.TO_EMAIL.split(',')
    .map(email => email.trim())
    .filter(Boolean);
  const { subject, text } = buildEmail(type, data);

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.FROM_EMAIL,
      to: recipients,
      reply_to: data.email,
      subject,
      text,
    }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      payload?.message ||
      payload?.error ||
      `Resend HTTP ${response.status}`;
    throw new Error(message);
  }

  return payload;
}

export async function handleLead(req, res, type) {
  if (applyCors(req, res)) return;

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    json(res, 405, { ok: false, error: 'method_not_allowed' });
    return;
  }

  try {
    assertEnv();

    if (!checkRateLimit(req)) {
      json(res, 429, { ok: false, error: 'rate_limited' });
      return;
    }

    const { data, errors } = validateLead(getBody(req), type);

    if (data.website) {
      json(res, 200, { ok: true });
      return;
    }

    if (Object.keys(errors).length > 0) {
      json(res, 400, { ok: false, errors });
      return;
    }

    const result = await sendWithResend(type, data);
    console.log(`Email ${type} envoye:`, result?.id || 'sans id');
    json(res, 200, { ok: true, id: result?.id });
  } catch (error) {
    console.error(`Erreur envoi email ${type}:`, error);
    json(res, 500, { ok: false, error: 'email_failed' });
  }
}
