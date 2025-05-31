import React, { useEffect, useState } from 'react';
import './DreamsHero.scss';
import { Link } from 'react-router-dom';

const DreamsHero: React.FC = () => {
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    setUsername(storedUsername);
  }, []);

  return (
    <section className="hero hero1">
      <div className="hero-wave-bg"></div>
      <div className="hero-container">
        {username && (
          <div className="hero-username" style={{ position: 'absolute', top: 10, right: 10, fontWeight: 'bold' }}>
            {username}
          </div>
        )}
        <div className="hero-content">
          <h2 className="dreams-title">
            Make a Dream Come True – Create a Miracle
          </h2>
          <p className="dreams-text">
            Everyone has a dream. Sometimes, it may seem out of reach, but
            together, we can make the impossible possible. On this platform, you
            can support those in need and help turn their cherished dreams into
            reality.
          </p>
          <p className="dreams-text">
            Together, we bring joy, hope, and inspiration. Join us and help make
            even more dreams possible!
          </p>
        </div>
        <div className="dreamshero-image">
          <img src="/dream-helper/dreams-page/block-1.png" alt="Block 1" />
        </div>
      </div>
    </section>
  );
};

export default DreamsHero;
