import React from 'react';
import './Footer.scss';
import { useIsMobile } from '../../hooks/use-mobile';

const Footer: React.FC = () => {
  const isMobile = useIsMobile();

  return (
    <footer className={`footer ${isMobile ? 'mobile' : ''}`}>
      <div className="footer-wave-bg"></div>
      <div className="footer-container">
        <div className="footer-left">
          <h2 className="footer-logo">DreamHelper</h2>
          <p className="footer-tagline">
            Make a Dream Come True – Create a Miracle
          </p>
        </div>

        <div className="footer-middle">
          <div className="footer-newsletter">
            <h3 className="newsletter-title">Stay Informed</h3>
            <p className="newsletter-text">
              Subscribe to our news to stay up to date with events
            </p>
            <form className="newsletter-form">
              <input
                type="email"
                placeholder="Email"
                className="newsletter-input"
              />
              <button type="submit" className="newsletter-button">
                Send
              </button>
            </form>
          </div>

          <div className="footer-links">
            <div className="links-column">
              <a href="#terms" className="footer-link">
                Terms & Conditions
              </a>
              <a href="#media" className="footer-link">
                Media
              </a>
              <a href="#contact" className="footer-link">
                Contact
              </a>
            </div>
          </div>
        </div>

        <div className="footer-right">
          <div className="social-links">
            <a
              href="https://www.instagram.com"
              className="social-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="/dream-helper/img/home-page/instagram.png"
                alt="Instagram"
              />
              Instagram
            </a>
            <a
              href="https://www.facebook.com"
              className="social-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="/dream-helper/img/home-page/facebook.png"
                alt="Facebook"
              />
              Facebook
            </a>
            <a
              href="https://www.pinterest.com"
              className="social-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="/dream-helper/img/home-page/pinterest.png"
                alt="Pinterest"
              />
              Pinterest
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
