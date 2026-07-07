// src/pages/ContactPage.tsx
import { useState } from 'react';
import { postJson } from '../lib/api';

type ContactFormState = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  website: string;
};

type ContactErrors = Partial<Record<keyof ContactFormState, string>>;

export function ContactPage() {
  const [form, setForm] = useState<ContactFormState>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    website: '',
  });

  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<
    'idle' | 'submitting' | 'success' | 'error'
  >('idle');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: ContactErrors = {};

    if (!form.name.trim()) {
      newErrors.name = 'Merci d’indiquer votre nom.';
    }

    if (!form.email.trim()) {
      newErrors.email = 'Merci d’indiquer votre email.';
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
      newErrors.email = 'Format d’email invalide.';
    }

    if (!form.message.trim()) {
      newErrors.message = 'Merci de préciser votre demande.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus('submitting');

    try {
      await postJson('/api/contact', form);

      setStatus('success');
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  const isDisabled = status === 'submitting';

  return (
    <div className="contact-page">
      {/* Intro */}
      <section style={{ padding: '2rem 0' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>
          Contactez Procarré &amp; Fils
        </h1>
        <p style={{ maxWidth: '36rem', color: '#4b5563' }}>
          Une question, un projet de carrelage ou de rénovation ? Envoyez-nous
          un message et nous reviendrons vers vous rapidement pour en parler.
        </p>
      </section>

      {/* Grille contact : formulaire + coordonnées */}
      <section className="contact-grid">
        {/* Colonne gauche : formulaire */}
        <div className="contact-left">
          {status === 'success' ? (
            <div>
              <p style={{ color: '#16a34a', marginBottom: '0.75rem' }}>
                Merci, votre message a bien été envoyé.
              </p>
              <p style={{ fontSize: '0.9rem', color: '#4b5563' }}>
                Nous vous recontacterons dans les meilleurs délais.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="contact-form">
              <input
                type="text"
                name="website"
                value={form.website}
                onChange={handleChange}
                tabIndex={-1}
                autoComplete="off"
                style={{ display: 'none' }}
              />

              <div>
                <input
                  name="name"
                  placeholder="Nom complet*"
                  value={form.name}
                  onChange={handleChange}
                  maxLength={80}
                  className="input"
                />
                {errors.name && (
                  <p style={{ color: '#b91c1c', fontSize: '0.8rem' }}>
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <input
                  name="email"
                  type="email"
                  placeholder="Email*"
                  value={form.email}
                  onChange={handleChange}
                  maxLength={120}
                  className="input"
                />
                {errors.email && (
                  <p style={{ color: '#b91c1c', fontSize: '0.8rem' }}>
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <input
                  name="phone"
                  placeholder="Téléphone"
                  value={form.phone}
                  onChange={handleChange}
                  maxLength={25}
                  className="input"
                />
              </div>

              <div>
                <input
                  name="subject"
                  placeholder="Objet de votre demande"
                  value={form.subject}
                  onChange={handleChange}
                  maxLength={120}
                  className="input"
                />
              </div>

              <div>
                <textarea
                  name="message"
                  placeholder="Votre message*"
                  value={form.message}
                  onChange={handleChange}
                  rows={5}
                  maxLength={2000}
                  className="textarea"
                />
                {errors.message && (
                  <p style={{ color: '#b91c1c', fontSize: '0.8rem' }}>
                    {errors.message}
                  </p>
                )}
              </div>

              {status === 'error' && (
                <p style={{ color: '#b91c1c', fontSize: '0.9rem' }}>
                  L’envoi a échoué. Vous pouvez réessayer ou nous contacter
                  directement par téléphone.
                </p>
              )}

              <button
                type="submit"
                disabled={isDisabled}
                className="btn btn-primary"
              >
                {status === 'submitting'
                  ? 'Envoi en cours...'
                  : 'Envoyer mon message'}
              </button>
            </form>
          )}
        </div>

        {/* Colonne droite : coordonnées */}
        <div className="contact-right">
          <h2 style={{ fontSize: '1.2rem', marginBottom: '0.75rem' }}>
            Coordonnées
          </h2>
          <p>
            Procarré &amp; Fils
            <br />
            04100 Manosque
          </p>
          <p style={{ marginTop: '0.75rem' }}>
            Téléphone : <strong>à compléter</strong>
            <br />
            Email : <strong>à compléter</strong>
          </p>
          <p style={{ marginTop: '0.75rem' }}>
            Intervention à Manosque et en Alpes-de-Haute-Provence pour vos
            projets de carrelage, rénovation et petits travaux de maçonnerie.
          </p>
        </div>
      </section>
    </div>
  );
}
