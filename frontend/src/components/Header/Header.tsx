import React, { useState } from 'react';
import './Header.scss';
import { Menu, X } from 'lucide-react';
import { useIsMobile } from '../../hooks/use-mobile';

const Header: React.FC = () => {
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="header">
      <div className="header-container">
        <h1 className="logo">DreamHelper</h1>

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
                      <a href="#dreams" onClick={() => setIsMenuOpen(false)}>
                        Dreams
                      </a>
                    </li>
                    <li className="nav-item">
                      <a href="#donors" onClick={() => setIsMenuOpen(false)}>
                        Top Donors
                      </a>
                    </li>
                  </ul>
                </nav>
                <button
                  className="login-button"
                  onClick={() => setIsMenuOpen(false)}
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
                    <a href="#dreams">Dreams</a>
                  </li>
                  <li className="nav-item">
                    <a href="#donors">Top Donors</a>
                  </li>
                </ul>
              </nav>
              <button className="login-button">Log In or Sign Up</button>
            </div>
            {/* <nav className="nav">
              <ul className="nav-list">
                <li className="nav-item"><a href="#dreams">Dreams</a></li>
                <li className="nav-item"><a href="#donors">Top Donors</a></li>
              </ul>
            </nav>
            <button className="login-button">Log In or Sign Up</button> */}
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
