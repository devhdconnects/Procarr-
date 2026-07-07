import { applyCors } from './_mail.js';

export default function handler(req, res) {
  if (applyCors(req, res)) return;

  res.status(200).json({
    ok: true,
    service: 'procarre-mail-api',
  });
}
