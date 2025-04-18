import React from 'react';
import './HowItWorks.scss';
import { useIsMobile } from '../../hooks/use-mobile';

const HowItWorks: React.FC = () => {
  const isMobile = useIsMobile();
  const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;

  return (
    <section className="how-it-works">
      <div className="how-it-works-wave-bg"></div>
      <div className="how-it-works-container">
        <h2 className="how-it-works-title">How It Works?</h2>

        <div
          className={`steps ${isMobile ? 'mobile' : ''} ${isTablet ? 'tablet' : ''}`}
        >
          <div className="step">
            <div className="step-number">1</div>
            <h3 className="step-title">Create a Dream</h3>
            <p className="step-description">
              Describe your dream, add a photo, and explain why it matters
            </p>
          </div>

          {!isMobile && <div className="step-divider"></div>}

          <div className="step">
            <div className="step-number">2</div>
            <h3 className="step-title">Receive Support</h3>
            <p className="step-description">
              People from around the world can contribute to your dream
            </p>
          </div>

          {!isMobile && <div className="step-divider"></div>}

          <div className="step">
            <div className="step-number">3</div>
            <h3 className="step-title">Make It Happen!</h3>
            <p className="step-description">
              Once the goal is reached, you can turn your dream into reality
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
