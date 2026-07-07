// src/components/DevisForm.tsx
import { useState } from 'react';
import { postJson } from '../lib/api';

type Props = {
  onClose?: () => void;
};

type FormState = {
  name: string;
  email: string;
  phone: string;
  city: string;
  projectType: string;
  budget: string;
  message: string;
  website: string;
};

type Errors = Partial<Record<keyof FormState, string>>;

export function DevisForm({ onClose }: Props) {
  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    phone: '',
    city: '',
    projectType: '',
    budget: '',
    message: '',
    website: '',
  });

  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<
    'idle' | 'submitting' | 'success' | 'error'
  >('idle');

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: Errors = {};

    if (!form.name.trim()) {
      newErrors.name = 'Merci d’indiquer votre nom.';
    }

    if (!form.email.trim()) {
      newErrors.email = 'Merci d’indiquer votre email.';
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
      newErrors.email = 'Format d’email invalide.';
    }

    if (!form.message.trim()) {
      newErrors.message = 'Merci de décrire votre projet.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus('submitting');

    try {
      await postJson('/api/devis', form);

      setStatus('success');
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  const isDisabled = status === 'submitting';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        zIndex: 50,
      }}
    >
      <div className="card" style={{ maxWidth: 520, width: '100%' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '1rem',
          }}
        >
          <h2 style={{ margin: 0 }}>Demander un devis</h2>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              style={{
                border: 'none',
                background: 'transparent',
                fontSize: '1.2rem',
              }}
            >
              ×
            </button>
          )}
        </div>

        {status === 'success' ? (
          <div>
            <p style={{ color: '#16a34a', marginBottom: '0.75rem' }}>
              Merci, votre demande de devis a bien été enregistrée.
            </p>
            <p className="text-muted">
              Nous vous recontacterons rapidement pour échanger sur votre
              projet de carrelage ou de rénovation.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-primary"
              style={{ marginTop: '1rem' }}
            >
              Fermer
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{ display: 'grid', gap: '0.75rem' }}
          >
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
                className="input"
              />
            </div>

            <div>
              <input
                name="city"
                placeholder="Ville / Commune"
                value={form.city}
                onChange={handleChange}
                className="input"
              />
            </div>

            <div>
              <select
                name="projectType"
                value={form.projectType}
                onChange={handleChange}
                className="select"
              >
                <option value="">Type de projet</option>
                <option value="salle-de-bain">Salle de bain</option>
                <option value="cuisine">Cuisine</option>
                <option value="piece-de-vie">Pièce de vie</option>
                <option value="terrasse">Terrasse</option>
                <option value="maconnerie">Maçonnerie / préparation</option>
                <option value="autre">Autre</option>
              </select>
            </div>

            <div>
              <select
                name="budget"
                value={form.budget}
                onChange={handleChange}
                className="select"
              >
                <option value="">Budget approximatif</option>
                <option value="-3000">Moins de 3 000 €</option>
                <option value="3000-8000">3 000 – 8 000 €</option>
                <option value="8000-15000">8 000 – 15 000 €</option>
                <option value="+15000">Plus de 15 000 €</option>
              </select>
            </div>

            <div>
              <textarea
                name="message"
                placeholder="Décrivez votre projet (surface, pièces concernées, délais...) *"
                value={form.message}
                onChange={handleChange}
                rows={4}
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
              style={{
                opacity: isDisabled ? 0.7 : 1,
              }}
            >
              {status === 'submitting'
                ? 'Envoi en cours...'
                : 'Envoyer ma demande'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
