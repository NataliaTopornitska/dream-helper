import { useNavigate } from 'react-router-dom';
import './AuthModal.scss';

const ProfilePage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    navigate('/');
  };

  return (
    <div className="profileContainer">
      <button onClick={handleLogout}>Log out</button>
    </div>
  );
};

export default ProfilePage;
