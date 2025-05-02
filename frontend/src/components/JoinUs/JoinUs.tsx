import React from 'react';
import './JoinUs.scss';
import { useIsMobile } from '../../use-mobile';
import { Link } from 'react-router-dom';

const JoinUs: React.FC = () => {
  const isMobile = useIsMobile();
  const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;

  return (
    <section className="join-us">
      <div className="join-us-wave-bg"></div>
      <div className="join-us-container">
        <h2 className="join-us-title">Join Us!</h2>
        <p className="join-us-subtitle">
          You can be part of this good cause right now:
        </p>

        <div
          className={`options-grid ${isMobile ? 'mobile' : ''} ${isTablet ? 'tablet' : ''}`}
        >
          <div className="option-card">
            <div className="option-image">
              <img
                src="/dream-helper/home-page/block6-1.png"
                alt="Support dream"
              />
            </div>
            <h3 className="option-title">Support a Dream</h3>
          </div>

          <div className="option-card">
            <div className="option-image">
              <img
                src="/dream-helper/home-page/block6-2.png"
                alt="Submit dream"
              />
            </div>
            <h3 className="option-title">Submit Your Dream</h3>
          </div>

          <div className="option-card">
            <div className="option-image">
              <img
                src="/dream-helper/home-page/block6-3.png"
                alt="Share stories"
              />
            </div>
            <h3 className="option-title">Share Stories</h3>
          </div>

          <div className="option-card">
            <div className="option-image">
              <img
                src="/dream-helper/home-page/block6-4.png"
                alt="Celebrate fulfilled dreams"
              />
            </div>
            <h3 className="option-title">Celebrate Fulfilled Dreams</h3>
          </div>
        </div>

        <div className="join-buttons">
          <button className="btn-outline">Add My Dream</button>
          <button className="btn-solid">
            <Link to="/dreams" className="btn-link">
              Make a Donation
            </Link>
          </button>
        </div>
      </div>
    </section>
  );
};

export default JoinUs;
