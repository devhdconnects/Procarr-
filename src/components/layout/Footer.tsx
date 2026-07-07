// src/components/layout/Footer.tsx
import './Footer.css';
import { Link } from 'react-router-dom';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer" aria-labelledby="footer-title">
      <div className="footer-shell">
        {/* Colonne identité / logo / édito */}
        <div className="footer-col footer-col-brand">
          <Link to="/" className="brand-logo footer-logo">
            <span className="brand-pro">PRO</span>
            <span className="brand-carre">CARRÉ</span>
            <span className="brand-separator">|</span>
            <span className="brand-fils">&amp; Fils</span>
          </Link>

          <h2 id="footer-title" className="footer-title">
            Carreleurs à Manosque et en Alpes-de-Haute-Provence
          </h2>
          <p className="footer-lead">
            Entreprise familiale de carrelage basée à Manosque, spécialisée dans les sols
            intérieurs, les salles de bain, les douches à l&apos;italienne et les terrasses
            carrelées en Alpes-de-Haute-Provence (04).
          </p>
          <div className="footer-nap">
            <span className="footer-nap-name">Procarré &amp; Fils</span>
            <span className="footer-nap-line">04100 Manosque – Alpes-de-Haute-Provence</span>
            <a href="tel:+33600000000" className="footer-nap-link">
              Tél. 06 00 00 00 00
            </a>
            <a href="mailto:contact@procarre.fr" className="footer-nap-link">
              contact@procarre.fr
            </a>
          </div>
        </div>

        {/* Colonne services */}
        <nav className="footer-col" aria-label="Liens services carrelage">
          <h3 className="footer-heading">Services de carrelage</h3>
          <ul className="footer-links">
            <li>
              <Link to="/prestations/sols-interieurs">
                Carrelage de sols et murs intérieurs
              </Link>
            </li>
            <li>
              <Link to="/prestations/salles-de-bain">
                Rénovation de salles de bain et douches à l&apos;italienne
              </Link>
            </li>
            <li>
              <Link to="/prestations/terrasses">
                Terrasses carrelées, escaliers et abords de piscine
              </Link>
            </li>
            <li>
              <Link to="/prestations/preparation-supports">
                Préparation des supports et petite maçonnerie
              </Link>
            </li>
            <li>
              <Link to="/realisations">
                Réalisations de chantiers de carrelage à Manosque
              </Link>
            </li>
          </ul>
        </nav>

        {/* Colonne zones + navigation édito */}
        <nav
          className="footer-col"
          aria-label="Zone d&apos;intervention et navigation secondaire"
        >
          <h3 className="footer-heading">Carrelage à Manosque et alentours</h3>
          <ul className="footer-links">
            <li>
              <Link to="/zone-intervention">
                Zone d&apos;intervention : Manosque et bassin manosquin
              </Link>
            </li>
            <li>
              <Link to="/a-propos">
                À propos de Procarré &amp; Fils
              </Link>
            </li>
            <li>
              <Link to="/contact">
                Contact et devis de carrelage
              </Link>
            </li>
            <li>
              <a
                href="https://www.google.com/maps/place/Manosque/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Voir Procarré &amp; Fils sur Google Maps
              </a>
            </li>
          </ul>
          <p className="footer-text-small">
            Travaux de carrelage à Manosque, Volx, Oraison, Forcalquier, Sainte-Tulle et dans les
            communes voisines d&apos;Alpes-de-Haute-Provence.
          </p>
        </nav>

        {/* Colonne légale / SEO bas de page */}
        <div className="footer-col footer-col-meta">
          <h3 className="footer-heading">Informations</h3>
          <ul className="footer-links">
            <li>
              <Link to="/mentions-legales">Mentions légales</Link>
            </li>
            <li>
              <Link to="/politique-de-confidentialite">
                Politique de confidentialité
              </Link>
            </li>
          </ul>
          <p className="footer-text-small">
            Site dédié aux travaux de carrelage, à la rénovation de salles de bain, aux douches
            à l&apos;italienne et aux terrasses carrelées à Manosque et en Alpes-de-Haute-Provence.
          </p>
          <p className="footer-copy">
            © {year} Procarré &amp; Fils – Artisan carreleur à Manosque (04).
          </p>
        </div>
      </div>
    </footer>
  );
}
