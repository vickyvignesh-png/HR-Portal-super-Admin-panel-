import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { AlertCircle, User, Lock, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import './Login.css';

export const Login = () => {
  const { isAuthenticated, login } = useApp();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isBothIncorrect, setIsBothIncorrect] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  // If already authenticated, redirect directly to dashboard
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const validate = () => {
    const errors = {};
    const usernameTrimmed = username.trim();

    if (!usernameTrimmed) {
      errors.username = 'Username is required.';
    } else if (!/^[a-zA-Z]+$/.test(usernameTrimmed)) {
      errors.username = 'Username must contain alphabetic characters only (A–Z, a–z).';
    } else if (fieldErrors.username && fieldErrors.username.includes('alphabetic characters')) {
      errors.username = fieldErrors.username;
    }

    if (!pin) {
      errors.pin = 'PIN is required.';
    } else if (pin.length !== 4) {
      errors.pin = 'PIN must be exactly 4 numeric digits.';
    } else if (fieldErrors.pin && fieldErrors.pin.includes('numeric digits')) {
      errors.pin = fieldErrors.pin;
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setIsBothIncorrect(false);
    }
    return Object.keys(errors).length === 0;
  };

  const handleUsernameChange = (e) => {
    const rawValue = e.target.value;
    // Allow alphabetic characters only (A-Z, a-z), rejecting numbers, spaces, symbols
    const alphabeticOnly = rawValue.replace(/[^a-zA-Z]/g, '');
    setUsername(alphabeticOnly);

    if (errorMessage) {
      setErrorMessage('');
    }

    if (isBothIncorrect) {
      setIsBothIncorrect(false);
      // Username edited: clear username error and show PIN error since PIN was wrong
      setFieldErrors({
        username: null,
        pin: 'Invalid PIN. Please enter the correct PIN.'
      });
      return;
    }

    // Validate while the user types
    if (rawValue && /[^a-zA-Z]/.test(rawValue)) {
      setFieldErrors((prev) => ({
        ...prev,
        username: 'Username must contain alphabetic characters only (A–Z, a–z). Numbers, spaces, and symbols are not allowed.'
      }));
    } else if (alphabeticOnly.length === 0 && fieldErrors.username) {
      setFieldErrors((prev) => ({
        ...prev,
        username: 'Username is required.'
      }));
    } else {
      setFieldErrors((prev) => ({
        ...prev,
        username: null
      }));
    }
  };

  const handlePinChange = (e) => {
    const rawValue = e.target.value;
    // Restrict input to numeric digits only and cap at 4 digits
    const numericOnly = rawValue.replace(/\D/g, '').slice(0, 4);
    setPin(numericOnly);

    if (errorMessage) {
      setErrorMessage('');
    }

    if (isBothIncorrect) {
      setIsBothIncorrect(false);
      // PIN edited: clear PIN error and show Username error since Username was wrong
      setFieldErrors({
        username: 'Invalid username. Please enter a valid username.',
        pin: null
      });
      return;
    }

    if (rawValue && /\D/.test(rawValue)) {
      setFieldErrors((prev) => ({
        ...prev,
        pin: 'PIN must contain numeric digits only (0–9).'
      }));
    } else if (numericOnly.length === 4) {
      setFieldErrors((prev) => ({
        ...prev,
        pin: null
      }));
    } else if (fieldErrors.pin && fieldErrors.pin.includes('numeric digits')) {
      setFieldErrors((prev) => ({
        ...prev,
        pin: numericOnly.length === 0 ? 'PIN is required.' : 'PIN must be exactly 4 numeric digits.'
      }));
    } else {
      setFieldErrors((prev) => ({
        ...prev,
        pin: null
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const cleanUsername = username.trim().toLowerCase();
      const cleanPin = pin.trim();

      const isUsernameCorrect = cleanUsername === 'hrportal';
      const isPinCorrect = cleanPin === '2026';

      if (isUsernameCorrect && isPinCorrect) {
        const result = login('hrportal@gmail.com', pin);
        setIsLoading(false);

        if (result.success) {
          addToast({
            type: 'success',
            title: 'Authentication Successful',
            message: 'Welcome to the HR Portal Super Admin console.'
          });
          navigate('/');
        } else {
          setErrorMessage(result.error || 'Invalid credentials');
        }
      } else {
        setIsLoading(false);
        if (!isUsernameCorrect && !isPinCorrect) {
          setIsBothIncorrect(true);
          setFieldErrors({
            username: 'Invalid username or PIN. Please try again.',
            pin: null
          });
        } else if (!isUsernameCorrect) {
          setIsBothIncorrect(false);
          setFieldErrors({
            username: 'Invalid username. Please enter a valid username.',
            pin: null
          });
        } else {
          setIsBothIncorrect(false);
          setFieldErrors({
            username: null,
            pin: 'Invalid PIN. Please enter the correct PIN.'
          });
        }
      }
    }, 350);
  };

  return (
    <div className="login-page-container">
      {/* Centered Two-Panel Card Container */}
      <div className="login-card-container">
        {/* Left Panel: Blue Welcome Section with CSS Decorative Circles & Curved Divider */}
        <div className="login-left-panel">
          <div className="login-decor-bulge" aria-hidden="true" />
          <div className="login-decor-sphere-main" aria-hidden="true" />
          <div className="login-decor-sphere-sub" aria-hidden="true" />

          <div className="welcome-text-content">
            <h2 className="welcome-heading">WELCOME TO HR PORTAL</h2>
            <p className="welcome-subtext">
              Manage your workforce with simplicity and confidence.
            </p>
          </div>
        </div>

        {/* Right Panel: Clean White Sign-In Form */}
        <div className="login-right-panel">
          <div className="login-decor-corner" aria-hidden="true" />

          <div className="login-form-inner">
            {/* 1. Existing HR Portal Logo */}
            <div className="login-logo-header">
              <img
                src="/assets/Blue%20HR%20Portal%20Logo%20on%20Transparency%20(1).png"
                alt="HR Portal Logo"
                className="login-brand-logo"
              />
            </div>

            {/* 2. Heading */}
            <h1 className="login-form-heading">Sign In</h1>

            {/* 3. Short Supporting Text */}
            <p className="login-form-subtext">
              Access your HR Portal Super Admin account.
            </p>

            {/* Error Banner */}
            {errorMessage && (
              <div className="login-error-alert" role="alert">
                <AlertCircle size={18} className="flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Sign-In Form */}
            <form onSubmit={handleSubmit} className="login-form-body" noValidate>
              {/* 4. Username Input */}
              <div className="login-input-group">
                <label htmlFor="login-username-input" className="login-input-label">
                  Username
                </label>
                <div
                  className={`login-input-wrapper ${
                    (fieldErrors.username || isBothIncorrect) ? 'input-error' : ''
                  }`}
                >
                  <User size={18} className="login-input-icon" />
                  <input
                    id="login-username-input"
                    data-testid="login-username-input"
                    name="username"
                    type="text"
                    value={username}
                    onChange={handleUsernameChange}
                    placeholder="Enter your username"
                    className="login-text-input"
                    autoComplete="username"
                    aria-label="Username"
                    disabled={isLoading}
                  />
                </div>
                {fieldErrors.username && (
                  <span className="login-error-message">
                    {fieldErrors.username}
                  </span>
                )}
              </div>

              {/* 5. PIN Input */}
              <div className="login-input-group">
                <label htmlFor="login-pin-input" className="login-input-label">
                  PIN
                </label>
                <div
                  className={`login-input-wrapper ${
                    (fieldErrors.pin || isBothIncorrect) ? 'input-error' : ''
                  }`}
                >
                  <Lock size={18} className="login-input-icon" />
                  <input
                    id="login-pin-input"
                    type={showPin ? 'text' : 'password'}
                    inputMode="numeric"
                    maxLength={4}
                    value={pin}
                    onChange={handlePinChange}
                    placeholder="Enter your 4-digit PIN"
                    className="login-text-input pin-input-field"
                    autoComplete="current-password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="login-pin-toggle-btn"
                    onClick={() => setShowPin(!showPin)}
                    aria-label={showPin ? 'Hide PIN' : 'Show PIN'}
                    title={showPin ? 'Hide PIN' : 'Show PIN'}
                    tabIndex={-1}
                  >
                    {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {fieldErrors.pin && (
                  <span className="login-error-message">{fieldErrors.pin}</span>
                )}
              </div>

              {/* 6. Forgot PIN Link */}
              <div className="login-forgot-wrapper">
                <button
                  type="button"
                  className="login-forgot-link"
                  onClick={() => setIsForgotModalOpen(true)}
                >
                  Forgot PIN?
                </button>
              </div>

              {/* 7. Primary Sign In Button */}
              <button
                type="submit"
                className="login-signin-button"
                disabled={isLoading}
                id="login-submit-btn"
              >
                {isLoading ? (
                  <span className="login-btn-loading">
                    <span className="login-spinner" />
                    <span>Signing In...</span>
                  </span>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Forgot PIN Frontend Modal */}
      {isForgotModalOpen && (
        <Modal
          isOpen={isForgotModalOpen}
          onClose={() => setIsForgotModalOpen(false)}
          title="Super Admin PIN Recovery"
          size="sm"
          footer={
            <Button variant="primary" onClick={() => setIsForgotModalOpen(false)}>
              Understood
            </Button>
          }
        >
          <div className="forgot-modal-body">
            <p className="forgot-modal-text">
              This is the HR Portal Super Admin demonstration environment.
            </p>
            <div className="forgot-modal-creds">
              <div className="forgot-cred-row">
                <span className="forgot-cred-label">Demo Username:</span>
                <span className="forgot-cred-val">hrportal</span>
              </div>
              <div className="forgot-cred-row">
                <span className="forgot-cred-label">Demo PIN:</span>
                <span className="forgot-cred-val">2026</span>
              </div>
            </div>
            <p className="forgot-modal-note">
              To reset your credentials in production, contact your organization's IT identity administrator or directory security team.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Login;
