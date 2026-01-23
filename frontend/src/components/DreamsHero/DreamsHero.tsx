import React, { useState, useEffect } from 'react';
import './DreamsHero.scss';
import { useNavigate } from 'react-router-dom';
import CreateDreamModal from '../UserProfile/CreateDreamModal';

const DreamsHero: React.FC = () => {
  const [isDreamModalOpen, setIsDreamModalOpen] = useState(false);
  const [isProfileIncompleteModalOpen, setIsProfileIncompleteModalOpen] =
    useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/v1/profiles/mine/', {
          headers: {
            Authorization: `Token ${localStorage.getItem('authToken') || ''}`,
          },
        });

        if (!res.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await res.json();

        setProfileData(data);
      } catch (err) {}
    };

    fetchProfile();

    if (localStorage.getItem('showIncompleteModal') === 'true') {
      setIsProfileIncompleteModalOpen(true);
      localStorage.removeItem('showIncompleteModal');
    }
  }, []);

  const email = profileData?.email || localStorage.getItem('username') || '';

  const handleAddDream = () => {
    const authToken = localStorage.getItem('authToken');

    if (!authToken) {
      setIsProfileIncompleteModalOpen(true);
    } else if (
      !profileData?.name ||
      profileData.name.trim() === '' ||
      profileData.name === email
    ) {
      localStorage.setItem('showIncompleteModal', 'true');
      navigate('/profile');
    } else {
      setIsDreamModalOpen(true);
    }
  };

  return (
    <section className="hero hero1">
      <div className="hero-wave-bg"></div>
      <div className="hero-container">
        <div className="hero-content">
          <h2 className="dreams-title">
            Make a Dream Come True – Create a Miracle
          </h2>
          <p className="dreams-text">
            Everyone has a dream. Sometimes, it may seem out of reach, but
            together, we can make the impossible possible. On this platform, you
            can support those in need and help turn their cherished dreams into
            reality.
          </p>
          <p className="dreams-text">
            Together, we bring joy, hope, and inspiration. Join us and help make
            even more dreams possible!
          </p>

          <button className="outline-btn" onClick={handleAddDream}>
            Add My Dream
          </button>
        </div>
        <div className="dreamshero-image">
          <img src="/dream-helper/dreams-page/block-1.png" alt="image" />
        </div>
      </div>

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
            <p>
              You are not logged in yet. Please log in and complete the required
              fields to add your dream!
            </p>
          </div>
        </div>
      )}
    </section>
  );
};

export default DreamsHero;
