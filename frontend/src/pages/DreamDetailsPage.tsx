import React, { useEffect } from 'react';
import DreamDetails from '../components/DreamDetails/DreamDetails';

const DreamDetailsPage: React.FC = () => {
  useEffect(() => {
    document.body.classList.add('dream-details-page');

    return () => {
      document.body.classList.remove('dream-details-page');
    };
  }, []);

  return <DreamDetails />;
};

export default DreamDetailsPage;
