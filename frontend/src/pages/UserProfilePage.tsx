import React, { useEffect } from 'react';
import UserProfile from '../components/UserProfile/UserProfile';

const UserProfilePage: React.FC = () => {
  useEffect(() => {
    document.body.classList.add('user-profile-page');

    return () => {
      document.body.classList.remove('user-profile-page');
    };
  }, []);

  return <UserProfile />;
};

export default UserProfilePage;
