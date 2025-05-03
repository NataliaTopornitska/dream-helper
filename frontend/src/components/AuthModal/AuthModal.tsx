import React, { useState } from 'react';
import './AuthModal.scss';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  authMode: 'login' | 'register';
  setAuthMode: (mode: 'login' | 'register') => void;
}

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  authMode,
  setAuthMode,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [activationMessage, setActivationMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setEmailError('');

      return;
    }

    const url =
      authMode === 'register'
        ? 'http://127.0.0.1:8000/api/v1/users/register/'
        : 'http://127.0.0.1:8000/api/v1/users/login/';

    setIsSubmitting(true);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit');
      }

      const data = await response.json();

      console.log(data);

      if (authMode === 'register') {
        setActivationMessage(
          'На ваш емейл надіслано код активації. Будь ласка, активуйте акаунт протягом 1 години, щоб увійти.',
        );
      } else {
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>{authMode === 'register' ? 'Sign Up' : 'Log In'}</h2>

        {activationMessage ? (
          <div className="activation-message">
            <p>{activationMessage}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
            />
            {emailError && <div className="error">{emailError}</div>}

            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />

            <button
              className="signup-btn"
              type="submit"
              disabled={isSubmitting}
            >
              {authMode === 'register' ? 'Sign Up' : 'Log In'}
            </button>
          </form>
        )}

        <p className="login-link">
          {authMode === 'register' ? (
            <span>
              Have an account?{' '}
              <a
                href="#"
                onClick={e => {
                  e.preventDefault();
                  setAuthMode('login');
                }}
              >
                Log In
              </a>
            </span>
          ) : (
            <span>
              <a
                href="#"
                onClick={e => {
                  e.preventDefault();
                  setAuthMode('register');
                }}
              >
                Create an account
              </a>
            </span>
          )}
        </p>
      </div>
    </div>
  );
};

export default AuthModal;
