import { handleLead } from './_mail.js';

export default async function handler(req, res) {
  await handleLead(req, res, 'contact');
}
