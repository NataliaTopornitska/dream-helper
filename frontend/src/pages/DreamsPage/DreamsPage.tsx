import React, { useEffect } from 'react';
import DreamsHero from '../../components/DreamsHero/DreamsHero';
import AllDreams from '../../components/DreamsCatalog/DreamsCatalog';

const DreamsPage: React.FC = () => {
  useEffect(() => {
    document.body.classList.add('dream-page');

    return () => {
      document.body.classList.remove('dream-page');
    };
  }, []);

  return (
    <>
      <DreamsHero />
      <AllDreams />
    </>
  );
};

export default DreamsPage;
