import React from 'react';
import './Hero.scss';

const Hero: React.FC = () => {
  return (
    <section className="hero">
      <div className="hero-wave-bg"></div>
      <div className="hero-container">
        <div className="hero-content">
          <h2 className="hero-title">Turning Dreams into Reality Together!</h2>
          <p className="hero-text">
            Kindness starts with a small step. Our platform is where dreams come
            true thanks to caring people. Help make dreams happen or share your
            own!
          </p>
          <div className="hero-buttons">
            <button className="btn-outline">Add My Dream</button>
            <button className="btn-solid">Make a Donation</button>
          </div>
        </div>
        <div className="hero-image">
          <img src="/dream-helper/img/home-page/block-1.png" alt="Block 1" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
