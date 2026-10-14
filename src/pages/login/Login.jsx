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
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    const emailTrimmed = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailTrimmed) {
      errors.email = 'Email address is required.';
    } else if (!emailRegex.test(emailTrimmed)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setIsBothIncorrect(false);
    }
    return Object.keys(errors).length === 0;
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);

    if (errorMessage) {
      setErrorMessage('');
    }

    if (isBothIncorrect) {
      setIsBothIncorrect(false);
      setFieldErrors({
        email: null,
        password: 'Invalid password. Please try again.'
      });
      return;
    }

    if (fieldErrors.email) {
      setFieldErrors((prev) => ({
        ...prev,
        email: null
      }));
    }
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);

    if (errorMessage) {
      setErrorMessage('');
    }

    if (isBothIncorrect) {
      setIsBothIncorrect(false);
      setFieldErrors({
        email: 'Invalid email. Please try again.',
        password: null
      });
      return;
    }

    if (fieldErrors.password) {
      setFieldErrors((prev) => ({
        ...prev,
        password: null
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
      const cleanEmail = email.trim().toLowerCase();
      const cleanPassword = password;

      const isEmailCorrect = cleanEmail === 'hrportal@gmail.com';
      const isPasswordCorrect = cleanPassword === 'Superadmin@2026';

      if (isEmailCorrect && isPasswordCorrect) {
        const result = login(cleanEmail, cleanPassword);
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
        if (!isEmailCorrect && !isPasswordCorrect) {
          setIsBothIncorrect(true);
          setFieldErrors({
            email: 'Invalid email or password. Please try again.',
            password: null
          });
        } else if (!isEmailCorrect) {
          setIsBothIncorrect(false);
          setFieldErrors({
            email: 'Invalid email. Please try again.',
            password: null
          });
        } else {
          setIsBothIncorrect(false);
          setFieldErrors({
            email: null,
            password: 'Invalid password. Please try again.'
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
              {/* 4. Email Address Input */}
              <div className="login-input-group">
                <label htmlFor="login-email-input" className="login-input-label">
                  Email Address
                </label>
                <div
                  className={`login-input-wrapper ${
                    (fieldErrors.email || isBothIncorrect) ? 'input-error' : ''
                  }`}
                >
                  <Mail size={18} className="login-input-icon" />
                  <input
                    id="login-email-input"
                    data-testid="login-email-input"
                    name="email"
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    placeholder="Enter your email address"
                    className="login-text-input"
                    autoComplete="email"
                    aria-label="Email Address"
                    disabled={isLoading}
                  />
                </div>
                {fieldErrors.email && (
                  <span className="login-error-message">
                    {fieldErrors.email}
                  </span>
                )}
              </div>

              {/* 5. Password Input */}
              <div className="login-input-group">
                <label htmlFor="login-password-input" className="login-input-label">
                  Password
                </label>
                <div
                  className={`login-input-wrapper ${
                    (fieldErrors.password || isBothIncorrect) ? 'input-error' : ''
                  }`}
                >
                  <Lock size={18} className="login-input-icon" />
                  <input
                    id="login-password-input"
                    data-testid="login-password-input"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="Enter your password"
                    className="login-text-input pin-input-field password-input-field"
                    autoComplete="current-password"
                    aria-label="Password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="login-pin-toggle-btn login-password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    title={showPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <span className="login-error-message">{fieldErrors.password}</span>
                )}
              </div>

              {/* 6. Forgot Password Link */}
              <div className="login-forgot-wrapper">
                <button
                  type="button"
                  className="login-forgot-link"
                  onClick={() => setIsForgotModalOpen(true)}
                >
                  Forgot Password?
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
          title="Super Admin Password Recovery"
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
                <span className="forgot-cred-label">Demo Password:</span>
                <span className="forgot-cred-val">••••••••</span>
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
