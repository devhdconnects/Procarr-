// server.js
import express from 'express';
import dotenv from 'dotenv';
import { Resend } from 'resend';

dotenv.config();

const app = express();
const resend = new Resend(process.env.RESEND_API_KEY);

app.use(express.json());

app.post('/api/contact', async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'Procarré <onboarding@resend.dev>', // remplace par ton domaine vérifié plus tard
      to: ['ton-email-de-reception@example.com'],
      replyTo: email,
      subject: subject || `Nouveau message de ${name}`,
      html: `
        <h2>Nouveau message depuis le formulaire Procarré</h2>
        <p><strong>Nom :</strong> ${name}</p>
        <p><strong>Email :</strong> ${email}</p>
        <p><strong>Téléphone :</strong> ${phone || '-'}</p>
        <p><strong>Objet :</strong> ${subject || '-'}</p>
        <p><strong>Message :</strong></p>
        <p>${(message || '').replace(/\n/g, '<br />')}</p>
      `,
    });

    if (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to send email' });
    }

    return res.status(200).json({ ok: true, id: data?.id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Unexpected error' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API contact http://localhost:${PORT}`);
});
