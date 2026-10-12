import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import '../styles/login.css';

export const Login = () => {
  const { isAuthenticated, login } = useApp();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  // If already logged in, redirect directly to dashboard
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const validate = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      errors.email = 'Email address is required';
    } else if (!emailRegex.test(email.trim())) {
      errors.email = 'Please provide a valid email format';
    }

    if (!pin) {
      errors.pin = 'Four-digit PIN is required';
    } else if (pin.length !== 4) {
      errors.pin = 'PIN must be exactly 4 numeric digits';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePinChange = (e) => {
    // Restrict input to digits only, max length 4
    const numericOnly = e.target.value.replace(/\D/g, '').slice(0, 4);
    setPin(numericOnly);
    if (fieldErrors.pin) {
      setFieldErrors((prev) => ({ ...prev, pin: null }));
    }
    if (errorMessage) setErrorMessage('');
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (fieldErrors.email) {
      setFieldErrors((prev) => ({ ...prev, email: null }));
    }
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validate()) return;

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
      <div className="login-card">
        {/* HR Portal logo above input fields */}
        <div className="login-brand-header">
          <img
            src="/assets/Blue%20HR%20Portal%20Logo%20on%20Transparency%20(1).png"
            alt="HR Portal Logo"
            className="login-logo-img"
          />
        </div>

        {errorMessage && (
          <div className="login-alert-error">
            <AlertCircle size={18} className="flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="login-email" className="form-label">
              Email Address <span className="required-star">*</span>
            </label>
            <input
              id="login-email"
              type="email"
              placeholder="e.g. hrportal@gmail.com"
              value={email}
              onChange={handleEmailChange}
              className={`form-input ${fieldErrors.email ? 'has-error' : ''}`}
              autoComplete="username"
              disabled={isLoading}
            />
            {fieldErrors.email && (
              <span className="form-error">{fieldErrors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="login-pin" className="form-label">
              Four-Digit Security PIN <span className="required-star">*</span>
            </label>
            <input
              id="login-pin"
              type="password"
              inputMode="numeric"
              maxLength={4}
              placeholder="••••"
              value={pin}
              onChange={handlePinChange}
              className={`form-input pin-input ${fieldErrors.pin ? 'has-error' : ''}`}
              autoComplete="current-password"
              disabled={isLoading}
            />
            {fieldErrors.pin && (
              <span className="form-error">{fieldErrors.pin}</span>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="spinner spinner-sm"></span>
                Signing In...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Sign In
                <ArrowRight size={16} />
              </span>
            )}
          </Button>

          <div className="login-forgot-container">
            <button
              type="button"
              className="forgot-pin-btn"
              onClick={() => setIsForgotModalOpen(true)}
            >
              Forgot PIN?
            </button>
          </div>
        </form>
      </div>

      {/* Forgot PIN Recovery Modal */}
      {isForgotModalOpen && (
        <Modal
          isOpen={isForgotModalOpen}
          onClose={() => setIsForgotModalOpen(false)}
          title="Demo PIN Recovery"
          size="sm"
          footer={
            <div className="flex justify-end w-full">
              <Button variant="primary" onClick={() => setIsForgotModalOpen(false)}>
                Got It
              </Button>
            </div>
          }
        >
          <div className="forgot-pin-content">
            <p className="text-secondary mb-3">
              This is a demonstration environment. The configured Super Admin demo credentials are:
            </p>
            <div className="recovery-creds-box">
              <div><strong>Email:</strong> hrportal@gmail.com</div>
              <div><strong>PIN:</strong> 2026</div>
            </div>
            <p className="text-muted text-xs mt-3">
              In production deployments, PIN resets require multi-factor verification through your organization's IT security directory.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Login;
