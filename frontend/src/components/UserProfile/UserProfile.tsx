import React, { useState, useEffect } from 'react';
import './UserProfile.scss';
import SettingsModal from './SettingsModal';
import ProfileDreams from './ProfileDreams';
import ProfileDonations from './ProfileDonations';
import PendingDonations from './PendingDonations';
import CreateDreamModal from './CreateDreamModal';

const UserProfile = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDreamModalOpen, setIsDreamModalOpen] = useState(false);
  const [isProfileIncompleteModalOpen, setIsProfileIncompleteModalOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [email, setEmail] = useState('');

  const fetchProfile = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/users/profile/', {
        headers: {
          Authorization: `Token ${localStorage.getItem('authToken') || ''}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch profile');
      const data = await res.json();
      setProfileData(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setProfileData(null);
    }
  };

  useEffect(() => {
    const storedEmail = localStorage.getItem('username');
    if (storedEmail) setEmail(storedEmail);

    fetchProfile(); // initial fetch

    const handleProfileUpdated = () => {
      fetchProfile(); // refresh profile when updated
    };

    window.addEventListener('profileUpdated', handleProfileUpdated);

    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdated);
    };
  }, []);

  useEffect(() => {
    const shouldShowModal = localStorage.getItem('showIncompleteModal') === 'true';
    if (shouldShowModal) {
      setIsProfileIncompleteModalOpen(true);
      localStorage.removeItem('showIncompleteModal');
    }
  }, []);

  const handleAddDream = () => {
    if (profileData && profileData.name && profileData.name !== email) {
      setIsDreamModalOpen(true);
    } else {
      setIsProfileIncompleteModalOpen(true);
    }
  };

  return (
    <>
      <div className="profile-container">
        <div className="profile-left">
          <img src="/dream-helper/profile-page/profile-photo.png" alt="User" className="profile-photo" />
          <div className="profile-info">
            <h2>
              {profileData
                ? (!profileData.name || profileData.name.trim() === '' || profileData.name === email)
                  ? email
                  : profileData.name
                : email || 'User Name'}
            </h2>
            <p><span>Location:</span> {profileData?.location || 'Not specified'}</p>
            <p><span>Email:</span> {email || 'Not logged in'}</p>
            <p><span>Phone:</span> {profileData?.phone_number || 'Not provided'}</p>
          </div>
        </div>

        <div className="profile-right">
          <img
            src="/dream-helper/profile-page/settings.png"
            alt="Settings"
            className="settings-icon"
            onClick={() => setIsSettingsOpen(true)}
          />
          <div className="profile-buttons">
            <button className="outline-btn" onClick={handleAddDream}>
              Add My Dream
            </button>
            <button className="solid-btn">Make a Donation</button>
          </div>
        </div>

        <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      </div>

      <div className="profile-dreams-wrapper"><ProfileDreams /></div>
      <div className="profile-dreams-wrapper"><ProfileDonations /></div>
      <div className="pending-donations-wrapper"><PendingDonations /></div>

      {isDreamModalOpen && (
        <CreateDreamModal onClose={() => setIsDreamModalOpen(false)} />
      )}

      {isProfileIncompleteModalOpen && (
        <div className="profile-incomplete-modal">
          <div className="modal-content">
            <button
              className="close-modal-cross"
              onClick={() => setIsProfileIncompleteModalOpen(false)}
              aria-label="Close modal"
            >
              ✖
            </button>
            <p>Your profile is incomplete! Please add information in the profile settings.</p>
            <img
              src="/dream-helper/profile-page/settings.png"
              alt="Settings"
              className="settings-icon-modal"
              onClick={() => {
                setIsSettingsOpen(true);
                setIsProfileIncompleteModalOpen(false);
              }}
              style={{ cursor: 'pointer', width: '30px', height: '30px' }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default UserProfile;
