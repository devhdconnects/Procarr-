// server/contact.ts (ou .js si tu n'es pas en TS)
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function postContact(req, res) {
  const { name, email, phone, subject, message } = req.body as {
    name: string;
    email: string;
    phone?: string;
    subject?: string;
    message: string;
  };

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL,             // ← à la place de contact@ton-domaine.fr
      to: [process.env.TO_EMAIL as string],     // ← ton email de réception
      replyTo: email,
      subject: subject || `Nouveau message de ${name}`,
      html: `
        <h2>Nouveau message depuis le formulaire Procarré</h2>
        <p><strong>Nom :</strong> ${name}</p>
        <p><strong>Email :</strong> ${email}</p>
        <p><strong>Téléphone :</strong> ${phone || '-'}</p>
        <p><strong>Objet :</strong> ${subject || '-'}</p>
        <p><strong>Message :</strong></p>
        <p>${message.replace(/\n/g, '<br />')}</p>
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
}
