import { useState, useEffect } from 'react';
import './Hero.scss';
import { Link, useNavigate } from 'react-router-dom';
import CreateDreamModal from '../UserProfile/CreateDreamModal';

const Hero = () => {
  const [isDreamModalOpen, setIsDreamModalOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [isProfileIncompleteModalOpen, setIsProfileIncompleteModalOpen] =
    useState(false);
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
          throw new Error('Failed to load profile data');
        }

        const data = await res.json();

        setProfileData(data);
      } catch (err) {}
    };

    fetchProfile();
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
    <section className="hero">
      <div className="hero-wave-bg"></div>
      <div className="hero-container">
        <div className="hero-content">
          <h2 className="hero-title">Turning Dreams into Reality Together!</h2>
          <p className="hero-text">
            Kindness starts with a small step. Our platform is where dreams come
            true thanks to caring people. Help make dreams happen or share your
            own!
          </p>
          <div className="hero-buttons">
            <button className="outline-btn" onClick={handleAddDream}>
              Add My Dream
            </button>
            <button className="btn-solid">
              <Link to="/dreams" className="btn-link">
                Make a Donation
              </Link>
            </button>
          </div>
        </div>
        <div className="hero-image">
          <img src="/dream-helper/home-page/block-1.png" alt="Block 1" />
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

export default Hero;
