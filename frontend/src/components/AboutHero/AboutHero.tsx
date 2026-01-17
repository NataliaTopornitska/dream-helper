import React from 'react';
import './AboutHero.scss';

const AboutHero: React.FC = () => {
  return (
    <section className="hero hero2">
      <div className="hero-wave-bg"></div>
      <div className="hero-container">
        <div className="hero-content">
          <h2 className="dreams-title1">Our Team</h2>
          <p className="dreams-text1">
            The DreamHelper was implemented with the help of these people.
          </p>
        </div>
        <div className="dreamshero-image">
          <img src="/dream-helper/about-us/block-1.png" alt="image" />
        </div>
      </div>
    </section>
  );
};

export default AboutHero;
