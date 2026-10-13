import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { AlertCircle, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import './Login.css';

export const Login = () => {
  const { isAuthenticated, login } = useApp();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  // If already authenticated, redirect directly to dashboard
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const validate = () => {
    const errors = {};
    const emailTrimmed = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailTrimmed) {
      errors.email = 'Email address is required.';
    } else if (!emailRegex.test(emailTrimmed)) {
      errors.email = 'Please enter a valid email address format.';
    }

    if (!pin) {
      errors.pin = 'PIN is required.';
    } else if (pin.length !== 4) {
      errors.pin = 'PIN must be exactly 4 numeric digits.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (fieldErrors.email) {
      setFieldErrors((prev) => ({ ...prev, email: null }));
    }
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  const handlePinChange = (e) => {
    // Restrict input to numeric digits only and cap at 4 digits
    const numericOnly = e.target.value.replace(/\D/g, '').slice(0, 4);
    setPin(numericOnly);
    if (fieldErrors.pin) {
      setFieldErrors((prev) => ({ ...prev, pin: null }));
    }
    if (errorMessage) {
      setErrorMessage('');
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
      const result = login(email, pin);
      setIsLoading(false);

      if (result.success) {
        addToast({
          type: 'success',
          title: 'Authentication Successful',
          message: 'Welcome to the HR Portal Super Admin console.'
        });
        navigate('/');
      } else {
        setErrorMessage(result.error || 'Invalid admin credentials');
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
              {/* 4. Email Address Input */}
              <div className="login-input-group">
                <label htmlFor="login-email-input" className="login-input-label">
                  Email Address
                </label>
                <div
                  className={`login-input-wrapper ${
                    fieldErrors.email ? 'input-error' : ''
                  }`}
                >
                  <Mail size={18} className="login-input-icon" />
                  <input
                    id="login-email-input"
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    placeholder="Enter your email address"
                    className="login-text-input"
                    autoComplete="username"
                    disabled={isLoading}
                  />
                </div>
                {fieldErrors.email && (
                  <span className="login-error-message">{fieldErrors.email}</span>
                )}
              </div>

              {/* 5. PIN Input */}
              <div className="login-input-group">
                <label htmlFor="login-pin-input" className="login-input-label">
                  PIN
                </label>
                <div
                  className={`login-input-wrapper ${
                    fieldErrors.pin ? 'input-error' : ''
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
                <span className="forgot-cred-label">Demo Email:</span>
                <span className="forgot-cred-val">hrportal@gmail.com</span>
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
