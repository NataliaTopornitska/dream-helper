import React from 'react';
import './DreamsHero.scss';

const DreamsHero: React.FC = () => {
  return (
    <section className="hero hero1">
      <div className="hero-wave-bg"></div>
      <div className="hero-container">
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
