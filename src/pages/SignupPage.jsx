import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  ArrowRight,
  RotateCcw,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import BackgroundOrbs from '../components/BackgroundOrbs';
import BrandHeader from '../components/BrandHeader';
import OtpInput from '../components/OtpInput';
import { sendOtp, registerUser } from '../services/api';

export default function SignupPage() {
  const navigate = useNavigate();

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [identifierType, setIdentifierType] = useState('EMAIL'); // 'EMAIL' | 'PHONE'
  const [identifier, setIdentifier] = useState('');
  const [verificationMode, setVerificationMode] = useState('PASSWORD'); // 'PASSWORD' | 'OTP'
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP State
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [otpPreview, setOtpPreview] = useState(null);

  // UI / Network State
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 60-Second Countdown Timer for OTP
  useEffect(() => {
    let interval = null;
    if (otpSent && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [otpSent, timer]);

  // Handle Switch between Email and Phone
  const handleIdentifierTypeChange = (type) => {
    setIdentifierType(type);
    setIdentifier('');
    setErrorMsg('');
  };

  // Handle Switch between Password and OTP verification
  const handleVerificationModeChange = (mode) => {
    setVerificationMode(mode);
    setErrorMsg('');
  };

  // Trigger Send / Resend OTP
  const handleSendOtp = async () => {
    setErrorMsg('');
    setSuccessMsg('');

    if (!identifier.trim()) {
      setErrorMsg(`Please enter your ${identifierType === 'EMAIL' ? 'email address' : 'phone number'} first.`);
      return;
    }

    if (identifierType === 'EMAIL' && !identifier.includes('@')) {
      setErrorMsg('Please enter a valid email format (e.g. name@aurastore.com).');
      return;
    }

    try {
      setLoading(true);
      const res = await sendOtp(identifier.trim(), 'REGISTRATION');
      setOtpSent(true);
      setTimer(60);
      setCanResend(false);
      setOtpCode('');
      setOtpPreview(res.otp || null);
      setSuccessMsg(res.message || `Verification code sent to ${identifier}`);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to dispatch verification code');
    } finally {
      setLoading(false);
    }
  };

  // Handle Sign Up Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Validations
    if (!fullName.trim()) {
      setErrorMsg('Full Name is required.');
      return;
    }
    if (!identifier.trim()) {
      setErrorMsg(`Please enter your ${identifierType === 'EMAIL' ? 'Email Address' : 'Phone Number'}.`);
      return;
    }

    if (verificationMode === 'PASSWORD') {
      if (!password) {
        setErrorMsg('Please enter a secure password.');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match. Please verify your re-entered password.');
        return;
      }
    } else {
      if (!otpSent) {
        setErrorMsg('Please request an OTP first by clicking "Send OTP".');
        return;
      }
      if (otpCode.length !== 6) {
        setErrorMsg('Please enter the complete 6-digit OTP code.');
        return;
      }
    }

    try {
      setLoading(true);
      const payload = {
        fullName: fullName.trim(),
        identifier: identifier.trim(),
        identifierType,
        authPreference: verificationMode,
        password: verificationMode === 'PASSWORD' ? password : null,
        confirmPassword: verificationMode === 'PASSWORD' ? confirmPassword : null,
        otpCode: verificationMode === 'OTP' ? otpCode : null,
      };

      const result = await registerUser(payload);

      // Trigger Celebration Confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#8b5cf6', '#d946ef', '#ec4899', '#ffffff'],
        });
      } catch {
        // Confetti fallback
      }

      setSuccessMsg(result.message || 'Registration successful! Navigating to Login...');

      // Automatically navigate to /login with registered identifier pre-filled
      setTimeout(() => {
        navigate('/login', {
          state: {
            prefillIdentifier: identifier.trim(),
            justRegistered: true,
          },
        });
      }, 1600);
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper theme-violet">
      <BackgroundOrbs theme="violet" />

      <div className="glass-container">
        <div className="glass-card">
          <div className="glass-content">
            {/* Minimal Luxury Insignia Header */}
            <BrandHeader
              theme="violet"
              badgeText="AURA LUXURY E-COMMERCE"
              title="Create Account"
              subtitle="Join our members-only universe with instant glassmorphic authentication"
            />

            {/* Error Notification */}
            {errorMsg && (
              <div className="alert-banner error">
                <AlertCircle size={18} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Success Notification */}
            {successMsg && (
              <div className="alert-banner success">
                <CheckCircle2 size={18} className="shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Live OTP Preview Badge for smooth demo & evaluation */}
            {otpPreview && verificationMode === 'OTP' && (
              <div className="alert-banner otp-preview">
                <Sparkles size={18} className="shrink-0" />
                <div>
                  <strong>Demo Verification Code:</strong>{' '}
                  <span style={{ letterSpacing: '2px', fontWeight: 'bold' }}>{otpPreview}</span>
                  <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>
                    Generated & saved to MySQL database table <code>otp_verifications</code>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* Field 1: Full Name */}
              <div className="form-group">
                <label className="form-label" htmlFor="fullName">
                  Full Name
                </label>
                <div className="input-wrapper">
                  <User size={18} className="input-icon" />
                  <input
                    id="fullName"
                    type="text"
                    className="glass-input"
                    placeholder="e.g. Prashant Choudhary"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    autoComplete="name"
                    required
                  />
                </div>
              </div>

              {/* Field 2: Identifier Switch (Email Address vs Phone Number) */}
              <div className="switch-container">
                <button
                  type="button"
                  className={`switch-button ${identifierType === 'EMAIL' ? 'active' : ''}`}
                  onClick={() => handleIdentifierTypeChange('EMAIL')}
                >
                  <Mail size={15} />
                  <span>Email Address</span>
                </button>
                <button
                  type="button"
                  className={`switch-button ${identifierType === 'PHONE' ? 'active' : ''}`}
                  onClick={() => handleIdentifierTypeChange('PHONE')}
                >
                  <Phone size={15} />
                  <span>Phone Number</span>
                </button>
              </div>

              {/* Dynamic Identifier Input */}
              <div className="form-group">
                <label className="form-label" htmlFor="identifier">
                  {identifierType === 'EMAIL' ? 'Email Address' : 'Phone Number'}
                </label>
                <div className="input-wrapper">
                  {identifierType === 'EMAIL' ? (
                    <Mail size={18} className="input-icon" />
                  ) : (
                    <Phone size={18} className="input-icon" />
                  )}
                  <input
                    id="identifier"
                    type={identifierType === 'EMAIL' ? 'email' : 'tel'}
                    className="glass-input"
                    placeholder={
                      identifierType === 'EMAIL'
                        ? 'prashant@aurastore.com'
                        : '+1 (555) 234-5678'
                    }
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    autoComplete={identifierType === 'EMAIL' ? 'email' : 'tel'}
                    required
                  />
                </div>
              </div>

              {/* Field 3: Verification Mode Switch (Password vs OTP Code) */}
              <div className="switch-container" style={{ marginTop: '1.25rem' }}>
                <button
                  type="button"
                  className={`switch-button ${verificationMode === 'PASSWORD' ? 'active' : ''}`}
                  onClick={() => handleVerificationModeChange('PASSWORD')}
                >
                  <Lock size={15} />
                  <span>Password Mode</span>
                </button>
                <button
                  type="button"
                  className={`switch-button ${verificationMode === 'OTP' ? 'active' : ''}`}
                  onClick={() => handleVerificationModeChange('OTP')}
                >
                  <KeyRound size={15} />
                  <span>OTP Code Mode</span>
                </button>
              </div>

              {/* Mode A: Password Verification */}
              {verificationMode === 'PASSWORD' && (
                <>
                  <div className="form-group">
                    <label className="form-label" htmlFor="password">
                      Password
                    </label>
                    <div className="input-wrapper">
                      <Lock size={18} className="input-icon" />
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        className="glass-input"
                        placeholder="Create password (6+ chars)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                        required
                      />
                      <button
                        type="button"
                        className="input-toggle-btn"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="confirmPassword">
                      Confirm Password
                    </label>
                    <div className="input-wrapper">
                      <Lock size={18} className="input-icon" />
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        className="glass-input"
                        placeholder="Re-enter password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        autoComplete="new-password"
                        required
                      />
                      <button
                        type="button"
                        className="input-toggle-btn"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Mode B: OTP Verification */}
              {verificationMode === 'OTP' && (
                <div className="otp-container">
                  {!otpSent ? (
                    <button
                      type="button"
                      className="btn-secondary-trigger"
                      onClick={handleSendOtp}
                      disabled={loading || !identifier.trim()}
                    >
                      <KeyRound size={16} />
                      <span>{loading ? 'Generating Code...' : 'Send 6-Digit OTP'}</span>
                    </button>
                  ) : (
                    <>
                      <div className="form-label" style={{ marginBottom: '0.65rem' }}>
                        <span>Enter 6-Digit Verification Code</span>
                        <span className="otp-timer">
                          <Clock size={13} />
                          {timer > 0 ? (
                            <span className="otp-timer-count">00:{timer < 10 ? `0${timer}` : timer}s</span>
                          ) : (
                            <span style={{ color: '#f87171' }}>Expired</span>
                          )}
                        </span>
                      </div>

                      {/* 6 Individual Numeric Boxes with Auto-Focus Advancing */}
                      <OtpInput
                        value={otpCode}
                        onChange={setOtpCode}
                        disabled={loading}
                        theme="violet"
                      />

                      <div className="otp-actions-bar">
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          Sent to {identifier}
                        </span>
                        <button
                          type="button"
                          className="btn-inline-otp"
                          onClick={handleSendOtp}
                          disabled={loading || !canResend}
                        >
                          <RotateCcw size={13} />
                          <span>Resend OTP</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Sign Up Button with glowing hover shine animation */}
              <button
                type="submit"
                className="btn-action-primary"
                disabled={loading}
              >
                <span>{loading ? 'Creating Account...' : 'Sign Up'}</span>
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>

            {/* Navigation link at bottom: Already have an account? Log In */}
            <div className="card-footer">
              <span>Already have an account?</span>
              <Link to="/login" className="nav-link-glow">
                Log In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
