import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SettingsModal.scss';

const SettingsModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSignOut = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    window.dispatchEvent(new Event('authChange'));
    onClose();
    navigate('/');
  };

  if (!isOpen) return null;

  return (
    <div className="settings-modal-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        <h2 className="modal-title">Settings</h2>
        <img
          src="/dream-helper/profile-page/change-setting.png"
          alt="Settings Illustration"
          className="modal-image"
        />

        <form className="settings-form">
          <div className="form-row">
            <input type="text" placeholder="Your Full Name" />
            <input type="text" placeholder="Your Phone Number" />
          </div>
          <div className="form-row">
            <input type="text" placeholder="Name of Your Country" />
            <input type="email" placeholder="Your Email" />
          </div>
          <div className="form-row single">
            <input type="text" placeholder="Name of Your City" />
          </div>

          <div className="signout-link">
            <button
              type="button"
              className="signout-button"
              onClick={handleSignOut}
            >
              Sign Out
            </button>
          </div>

          <button className="save-button" type="submit">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default SettingsModal;
