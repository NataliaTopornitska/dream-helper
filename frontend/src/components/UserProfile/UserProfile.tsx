import React, { useState, useEffect } from 'react';
import './UserProfile.scss';
import SettingsModal from './SettingsModal';
import ProfileDreams from './ProfileDreams';
import ProfileDonations from './ProfileDonations';
import PendingDonations from './PendingDonations';
import CreateDreamModal from './CreateDreamModal';
import { Link } from 'react-router-dom';

const UserProfile = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDreamModalOpen, setIsDreamModalOpen] = useState(false);
  const [isProfileIncompleteModalOpen, setIsProfileIncompleteModalOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [email, setEmail] = useState('');

  const fetchProfile = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/profiles/mine/', {
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

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      alert('No file selected');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file.');
      return;
    }

    event.target.value = null;

    const formData = new FormData();
    formData.append('photo_avatar', file);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/profiles/mine/upload_avatar/', {
        method: 'POST',
        headers: {
          Authorization: `Token ${localStorage.getItem('authToken') || ''}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Failed to upload image');
        return;
      }

      alert(data.message || 'Avatar uploaded successfully');

      setProfileData((prev) => ({
        ...prev,
        avatar_url: `${data.avatar_url}?t=${Date.now()}`,
      }));

      fetchProfile();

    } catch (err) {
      console.error('Upload error:', err);
      alert('Something went wrong during upload');
    }
  };

  useEffect(() => {
    const storedEmail = localStorage.getItem('username');
    if (storedEmail) setEmail(storedEmail);

    fetchProfile();

    const handleProfileUpdated = () => {
      fetchProfile();
    };

    window.addEventListener('profileUpdated', handleProfileUpdated);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdated);
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
          <div className="avatar-wrapper" style={{ position: 'relative' }}>
            <img
              src={profileData?.avatar_url || "/dream-helper/profile-page/profile-photo.png"}
              alt="User"
              className="profile-photo"
            />
            <label
              className="upload-icon"
              style={{
                position: 'absolute',
                bottom: '5px',
                right: '20px',
                cursor: 'pointer',
              }}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                style={{ display: 'none' }}
              />
              <img
                src="/dream-helper/profile-page/camera.png"
                alt="Upload"
                style={{ width: '24px', height: '24px' }}
              />
            </label>
          </div>

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
            <p><span>Direction:</span> {profileData?.direction || 'Not specified'}</p>
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
            <Link to="/dreams" className="solid-btn-link">
              <button className="solid-btn">Make a Donation</button>
            </Link>
          </div>
        </div>

        <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      </div>

      <div className="profile-dreams-wrapper"><ProfileDreams /></div>
      <div className="profile-dreams-wrapper"><ProfileDonations /></div>
      <div className="pending-donations-wrapper"><PendingDonations /></div>

      {isDreamModalOpen && (
        <CreateDreamModal
          isOpen={isDreamModalOpen}
          onClose={() => setIsDreamModalOpen(false)}
        />
      )}

      {isProfileIncompleteModalOpen && (
        <div className="profile-incomplete-modal">
          <div className="modal-contents">
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
