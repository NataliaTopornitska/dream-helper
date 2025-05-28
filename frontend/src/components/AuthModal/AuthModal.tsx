import React, { useState, useEffect } from 'react';
import './AuthModal.scss';
import { login, register, getDreams } from '../../api/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  authMode: 'login' | 'register';
  setAuthMode: (mode: 'login' | 'register') => void;
  onLoginSuccess: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  authMode,
  setAuthMode,
  onLoginSuccess,
}) => {
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [activationMessage, setActivationMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setCredential('');
    setPassword('');
  }, [authMode]);

  useEffect(() => {
    if (activationMessage) {
      const timer = setTimeout(() => {
        setActivationMessage('');
        setAuthMode('login');
        onClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [activationMessage, setAuthMode, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setCredential('');
      setPassword('');
      setEmailError('');
      setActivationMessage('');
      setIsSubmitting(false);
      setShowPassword(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (authMode === 'register' && (!credential || !/\S+@\S+\.\S+/.test(credential))) {
      setEmailError('Please enter a valid email');
      return;
    }

    setEmailError('');
    setIsSubmitting(true);

    try {
      const response =
        authMode === 'register'
          ? await register({ email: credential, password })
          : await login({ username: credential, password });

      if (!response.ok) {
        throw new Error('Failed to submit');
      }

      const data = await response.json();
      console.log(data);

      if (authMode === 'register') {
        setActivationMessage(
          'An activation code has been sent to your email. Please activate your account within 1 hour to log in.'
        );
      } else {
        const token = data.access || data.token || data.key;
        const username = data.username || data.email || '';

        if (token) {
          localStorage.setItem('authToken', token);
          localStorage.setItem('username', username);
          onLoginSuccess();

          setActivationMessage('Login successful! Redirecting...');
        } else {
          throw new Error('Token not received');
        }
      }

      setCredential('');
      setPassword('');
    } catch (error) {
      console.error('Error:', error);
      setActivationMessage(
        authMode === 'login'
          ? 'Login failed. Please try again.'
          : 'Registration failed. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>{authMode === 'register' ? 'Sign Up' : 'Log In'}</h2>

        {activationMessage ? (
          <div
            className={`activation-message ${
              activationMessage.toLowerCase().includes('failed') ? 'error' : 'success'
            }`}
          >
            <p>{activationMessage}</p>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit}>
              <label>Email</label>
              <input
                type="email"
                value={credential}
                onChange={e => setCredential(e.target.value)}
                placeholder="Enter your email address"
                required
              />
              {emailError && <div className="error">{emailError}</div>}

              <label>Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
                <img
                  src={showPassword ? '/dream-helper/home-page/eye-form.svg' : '/dream-helper/home-page/eye-off.svg'}
                  alt="Toggle visibility"
                  className="eye-icon"
                  onClick={() => setShowPassword(prev => !prev)}
                />
              </div>

              {authMode === 'login' && (
                <div className="forgot-password-text">Forgot password?</div>
              )}
              <button className="signup-btn" type="submit" disabled={isSubmitting}>
                {authMode === 'register' ? 'Sign Up' : 'Log In'}
              </button>
            </form>

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
          </>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
