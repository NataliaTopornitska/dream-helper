import React, { useState, useEffect } from 'react';
import './UserProfile.scss';
import SettingsModal from './SettingsModal';

const UserProfile = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const storedEmail = localStorage.getItem('username');
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  return (
    <div className="profile-container">
      <div className="profile-left">
        <img
          src="/dream-helper/profile-page/profile-photo.png"
          alt="User"
          className="profile-photo"
        />
        <div className="profile-info">
          <h2>Ethan Harvey</h2>
          <p>
            <span>Location:</span> Amsterdam, Netherlands
          </p>
          <p>
            <span>Email:</span> {email || 'Not logged in'}
          </p>
          <p>
            <span>Phone:</span> +1 345 876 4805
          </p>
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
          <button className="outline-btn">Add My Dream</button>
          <button className="solid-btn">Make a Donation</button>
        </div>
      </div>

      {/* Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};

export default UserProfile;
