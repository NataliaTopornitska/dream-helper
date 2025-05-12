import React, { useEffect } from 'react';
import Hero from '../components/Hero/Hero';
import Statistics from '../components/Statistics/Statistics';
import DreamCarousel from '../components/DreamCarousel/DreamCarousel';
import Vision from '../components/Vision/Vision';
import HowItWorks from '../components/HowItWorks/HowItWorks';
import JoinUs from '../components/JoinUs/JoinUs';

const HomePage: React.FC = () => {
  useEffect(() => {
    document.body.classList.add('home-page');

    return () => {
      document.body.classList.remove('home-page');
    };
  }, []);

  return (
    <>
      <Hero />
      <Statistics />
      <DreamCarousel />
      <Vision />
      <HowItWorks />
      <JoinUs />
    </>
  );
};

export default HomePage;
