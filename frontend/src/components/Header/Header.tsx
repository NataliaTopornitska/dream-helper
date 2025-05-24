import React, { useState, useEffect } from 'react';
import './Header.scss';
import { Menu, X } from 'lucide-react';
import { useIsMobile } from '../../use-mobile';
import { Link } from 'react-router-dom';
import AuthModal from '../AuthModal/AuthModal';

const Header: React.FC = () => {
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const storedUsername = localStorage.getItem('username');

    setIsLoggedIn(!!token);
    setUsername(storedUsername);
  }, []);

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
                    <li className="nav-item">
                      <Link to="/dreams" onClick={() => setIsMenuOpen(false)}>
                        Dreams
                      </Link>
                    </li>
                    <li className="nav-item">
                      <a href="" onClick={() => setIsMenuOpen(false)}>
                        Top Donors
                      </a>
                    </li>
                  </ul>
                </nav>
                {isLoggedIn ? (
                      <div className="profile-link-wrapper" onClick={() => setIsMenuOpen(false)}>
                    <Link to="/profile" className="profile-link">
                      Profile
                    </Link>
                    {username && <div className="username-display">{username}</div>}
                  </div>
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
                <li className="nav-item">
                  <Link to="/dreams">Dreams</Link>
                </li>
                <li className="nav-item">
                  <a href="">Top Donors</a>
                </li>
              </ul>
            </nav>
            {isLoggedIn ? (
              <div className="profile-link-wrapper" onClick={() => setIsMenuOpen(false)}>
                <Link to="/profile" className="profile-link">
                  Profile
                </Link>
                {username && <div className="username-display">{username}</div>}
              </div>
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
          setUsername(localStorage.getItem('username'));
          setIsAuthModalOpen(false);
        }}
      />
    </header>
  );
};

export default Header;
