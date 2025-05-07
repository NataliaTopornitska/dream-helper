import React, { useState } from 'react';
import './DreamsHeader.scss';
import { Menu, X } from 'lucide-react';
import { useIsMobile } from '../../use-mobile';
import { Link } from 'react-router-dom';
import AuthModal from '../AuthModal/AuthModal';

const DreamsHeader: React.FC = () => {
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="header">
      <div className="header-container">
        <h1 className="logo">
          <Link to="/" className="link">
            DreamHelper
          </Link>
        </h1>
        {isMobile ? (
          <>
            <button className="menu-toggle" onClick={toggleMenu}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {isMenuOpen && (
              <div className="mobile-nav">
                <nav className="nav">
                  <ul className="nav-list">
                    <li className="nav-items">
                      <a
                        href="/dream-helper/#/"
                        className="dreams-link"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Home page
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="" onClick={() => setIsMenuOpen(false)}>
                        Top Donors
                      </a>
                    </li>
                  </ul>
                </nav>
                <button
                  className="login-button"
                  onClick={() => {
                    setIsAuthModalOpen(true);
                    setAuthMode('login');
                  }}
                >
                  Log In or Sign Up
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="nav-block">
              <nav className="nav">
                <ul className="nav-list">
                  <li className="nav-item">
                    <Link to="/dreams">Dreams</Link>
                  </li>
                  <li className="nav-item">
                    <a href="">Top Donors</a>
                  </li>
                </ul>
              </nav>
              <button
                className="login-button"
                onClick={() => setIsAuthModalOpen(true)}
              >
                Log In or Sign Up
              </button>
            </div>
          </>
        )}
      </div>
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        authMode={authMode}
        setAuthMode={setAuthMode}
      />
    </header>
  );
};

export default DreamsHeader;
