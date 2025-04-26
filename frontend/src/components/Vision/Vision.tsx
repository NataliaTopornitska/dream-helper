import React from 'react';
import './Vision.scss';
import { useIsMobile } from '../../use-mobile';

const Vision: React.FC = () => {
  const isMobile = useIsMobile();

  return (
    <section className="vision">
      <div className="vision-container">
        <div className={`vision-content ${isMobile ? 'mobile' : ''}`}>
          <div className="vision-image">
            <img
              src="/dream-helper/home-page/block-4.png"
              alt="Person with megaphone"
            />
          </div>

          <div className="vision-text">
            <h2 className="vision-title">Our Vision</h2>
            <p className="vision-description">
              We created this platform so that everyone has the chance to make
              their dream a reality—whether it's education, medical treatment,
              travel, or helping loved ones. We connect dreamers and donors to
              change lives for the better.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Vision;
