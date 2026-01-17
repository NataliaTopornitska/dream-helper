import React, { useEffect } from 'react';
import AboutHero from '../components/AboutHero/AboutHero';
import AboutUs from '../components/AboutUs/AboutUs';

const AboutPage: React.FC = () => {
  useEffect(() => {
    document.body.classList.add('about-page');

    return () => {
      document.body.classList.remove('about-page');
    };
  }, []);

  return (
    <>
      <AboutHero />
      <AboutUs />
    </>
  );
};

export default AboutPage;
