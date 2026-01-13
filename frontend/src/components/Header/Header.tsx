import React, { useState, useEffect } from 'react';
import './Header.scss';
import { Menu, X } from 'lucide-react';
import { useIsMobile } from '../../use-mobile';
import { Link, useLocation } from 'react-router-dom';
import AuthModal from '../AuthModal/AuthModal';

const Header: React.FC = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const currentPath = location.pathname;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      setIsLoggedIn(!!token);
    };

    checkAuth();

    window.addEventListener('authChange', checkAuth);

    return () => {
      window.removeEventListener('authChange', checkAuth);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActive = (path: string) =>
    currentPath === path || currentPath.startsWith(path);

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
                    <li className={`nav-item ${isActive('/dreams') ? 'active' : ''}`}>
                      <Link to="/dreams" onClick={() => setIsMenuOpen(false)}>
                        Dreams
                      </Link>
                    </li>
                    <li className={`nav-item ${isActive('/about-us') ? 'active' : ''}`}>
                      <Link to="/about-us" onClick={() => setIsMenuOpen(false)}>
                        About us
                      </Link>
                    </li>
                  </ul>
                </nav>
                {isLoggedIn ? (
                  <Link
                    to="/profile"
                    className="profile-link"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                ) : (
                  <button
                    className="login-button"
                    onClick={() => {
                      setIsAuthModalOpen(true);
                      setAuthMode('login');
                      setIsMenuOpen(false);
                    }}
                  >
                    Log In or Sign Up
                  </button>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="nav-block">
            <nav className="nav">
              <ul className="nav-list">
                <li className={`nav-item ${isActive('/dreams') ? 'active' : ''}`}>
                  <Link to="/dreams">Dreams</Link>
                </li>
                <li className={`nav-item ${isActive('/avout-us') ? 'active' : ''}`}>
                  <Link to="/about-us">About us</Link>
                </li>
              </ul>
            </nav>
            {isLoggedIn ? (
              <Link
                to="/profile"
                className={`profile-link ${isActive('/profile') ? 'active' : ''}`}
              >
                Profile
              </Link>
            ) : (
              <button
                className="login-button"
                onClick={() => setIsAuthModalOpen(true)}
              >
                Log In or Sign Up
              </button>
            )}
          </div>
        )}
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        authMode={authMode}
        setAuthMode={setAuthMode}
        onLoginSuccess={() => {
          setIsLoggedIn(true);
          setIsAuthModalOpen(false);
        }}
      />
    </header>
  );
};

export default Header;
