import React, { useState, useEffect } from 'react';
import './JoinUs.scss';
import { useIsMobile } from '../../use-mobile';
import { Link, useNavigate } from 'react-router-dom';
import CreateDreamModal from '../UserProfile/CreateDreamModal';

const JoinUs: React.FC = () => {
  const isMobile = useIsMobile();
  const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;

  const [isDreamModalOpen, setIsDreamModalOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [isProfileIncompleteModalOpen, setIsProfileIncompleteModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/v1/profiles/mine/', {
          headers: {
            Authorization: `Token ${localStorage.getItem('authToken') || ''}`,
          },
        });
        if (!res.ok) throw new Error('Failed to load profile data');
        const data = await res.json();
        setProfileData(data);
      } catch (err) {
        console.error('Failed to load profile data:', err);
      }
    };
    fetchProfile();
  }, []);

  const email = profileData?.email || localStorage.getItem('username') || '';

  const handleAddDream = () => {
    const authToken = localStorage.getItem('authToken');

    if (!authToken) {
      setIsProfileIncompleteModalOpen(true);
    } else if (!profileData?.name || profileData.name.trim() === '' || profileData.name === email) {
      localStorage.setItem('showIncompleteModal', 'true');
      navigate('/profile');
    } else {
      setIsDreamModalOpen(true);
    }
  };

  return (
    <section className="join-us">
      <div className="join-us-wave-bg"></div>
      <div className="join-us-container">
        <h2 className="join-us-title">Join Us!</h2>
        <p className="join-us-subtitle">
          You can be part of this good cause right now:
        </p>

        <div className={`options-grid ${isMobile ? 'mobile' : ''} ${isTablet ? 'tablet' : ''}`}>
          <div className="option-card">
            <div className="option-image">
              <img src="/dream-helper/home-page/block6-1.png" alt="Support dream" />
            </div>
            <h3 className="option-title">Support a Dream</h3>
          </div>

          <div className="option-card">
            <div className="option-image">
              <img src="/dream-helper/home-page/block6-2.png" alt="Submit dream" />
            </div>
            <h3 className="option-title">Submit Your Dream</h3>
          </div>

          <div className="option-card">
            <div className="option-image">
              <img src="/dream-helper/home-page/block6-3.png" alt="Share stories" />
            </div>
            <h3 className="option-title">Share Stories</h3>
          </div>

          <div className="option-card">
            <div className="option-image">
              <img src="/dream-helper/home-page/block6-4.png" alt="Celebrate fulfilled dreams" />
            </div>
            <h3 className="option-title">Celebrate Fulfilled Dreams</h3>
          </div>
        </div>

        <div className="join-buttons">
          <button className="btn-outline" onClick={handleAddDream}>
            Add My Dream
          </button>
          <button className="btn-solid">
            <Link to="/dreams" className="btn-link">
              Make a Donation
            </Link>
          </button>
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
          <div className="modal-h-content">
            <button
              className="close-modal-cross"
              onClick={() => setIsProfileIncompleteModalOpen(false)}
              aria-label="Close modal"
            >
              ✖
            </button>
            <p>You are not logged in yet. Please log in and complete the required fields to add your dream!</p>
          </div>
        </div>
      )}
    </section>
  );
};

export default JoinUs;
