import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
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
  LogOut,
  Sparkles,
  ShieldCheck,
  Database,
  Key,
  ShoppingBag,
  ShoppingCart,
  Package,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import BackgroundOrbs from '../components/BackgroundOrbs';
import BrandHeader from '../components/BrandHeader';
import OtpInput from '../components/OtpInput';
import PasswordRequirements from '../components/PasswordRequirements';
import { sendOtp, loginUser, logoutUser, changePassword } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, logout, currentUser: authContextUser, authToken: authContextToken } = useAuth();

  // Identifier state with real-time Email vs Phone auto-detection
  const [identifier, setIdentifier] = useState('');
  const [authMode, setAuthMode] = useState('PASSWORD'); // 'PASSWORD' | 'OTP'
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP State
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [otpPreview, setOtpPreview] = useState(null);

  // User session state
  const [currentUser, setCurrentUser] = useState(authContextUser);
  const [authToken, setAuthToken] = useState(authContextToken);

  useEffect(() => {
    if (authContextUser) setCurrentUser(authContextUser);
    if (authContextToken) setAuthToken(authContextToken);
  }, [authContextUser, authContextToken]);

  // Change Password state (within Dashboard)
  const [showChangePasswordSection, setShowChangePasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);
  const [changePasswordMsg, setChangePasswordMsg] = useState('');
  const [changePasswordError, setChangePasswordError] = useState('');

  // Feedback & Loading state
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Check for pre-filled identifier from successful Sign Up or Password Reset
  useEffect(() => {
    if (location.state?.prefillIdentifier) {
      setIdentifier(location.state.prefillIdentifier);
      if (location.state.justRegistered) {
        setSuccessMsg(`Welcome to AURA! Account ready for ${location.state.prefillIdentifier}. Please sign in.`);
      } else if (location.state.justReset) {
        setSuccessMsg(`Password successfully updated for ${location.state.prefillIdentifier}. Please log in.`);
      }
    }
  }, [location.state]);

  // Real-time Identifier Auto-Detection
  const detectedType = React.useMemo(() => {
    const trimmed = identifier.trim();
    if (!trimmed) return null;
    if (trimmed.includes('@') || /[a-zA-Z]/.test(trimmed)) {
      return 'Email';
    }
    if (/^[+0-9\s\-()]+$/.test(trimmed)) {
      return 'Phone Number';
    }
    return null;
  }, [identifier]);

  // 60-Second Countdown Timer
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

  // Trigger Send / Resend OTP for Login
  const handleSendOtp = async () => {
    setErrorMsg('');
    setSuccessMsg('');

    if (!identifier.trim()) {
      setErrorMsg('Please enter your Email or Phone Number first.');
      return;
    }

    try {
      setLoading(true);
      const res = await sendOtp(identifier.trim(), 'LOGIN');
      setOtpSent(true);
      setTimer(60);
      setCanResend(false);
      setOtpCode('');
      setOtpPreview(res.otp || null);
      setSuccessMsg(res.message || `Login OTP sent to ${identifier}`);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to dispatch verification code');
    } finally {
      setLoading(false);
    }
  };

  // Handle Login submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!identifier.trim()) {
      setErrorMsg('Please enter your Email or Phone Number.');
      return;
    }

    if (authMode === 'PASSWORD') {
      if (!password) {
        setErrorMsg('Please enter your password.');
        return;
      }
    } else {
      if (!otpSent) {
        setErrorMsg('Please click "Send 6-Digit OTP" to receive your login code.');
        return;
      }
      if (otpCode.length !== 6) {
        setErrorMsg('Please enter the complete 6-digit OTP code.');
        return;
      }
    }

    try {
      setLoading(true);
      const result = await loginUser({
        identifier: identifier.trim(),
        authMode,
        password: authMode === 'PASSWORD' ? password : null,
        otpCode: authMode === 'OTP' ? otpCode : null,
      });

      // Celebration confetti on login success
      try {
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#06b6d4', '#3b82f6', '#10b981', '#ffffff'],
        });
      } catch {
        // Confetti fallback
      }

      setCurrentUser(result.user);
      setAuthToken(result.token);
      login(result.token, result.user);
      setSuccessMsg(`Welcome back, ${result.user?.fullName || 'Valued Member'}!`);
      const target = location.state?.from || '/dashboard';
      setTimeout(() => {
        navigate(target);
      }, 1000);
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Change Password (for Authenticated Users)
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setChangePasswordError('');
    setChangePasswordMsg('');

    if (!currentPassword) {
      setChangePasswordError('Please enter your current password.');
      return;
    }
    if (newPassword.length < 8) {
      setChangePasswordError('New password must be at least 8 characters long.');
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setChangePasswordError('New password must include at least one uppercase letter (A-Z).');
      return;
    }
    if (!/[a-z]/.test(newPassword)) {
      setChangePasswordError('New password must include at least one lowercase letter (a-z).');
      return;
    }
    if (!/\d/.test(newPassword)) {
      setChangePasswordError('New password must include at least one numeric digit (0-9).');
      return;
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
      setChangePasswordError('New password must include at least one special character (!@#$%^&* etc.).');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setChangePasswordError('New password and confirmation password do not match.');
      return;
    }

    try {
      setChangePasswordLoading(true);
      const res = await changePassword(
        {
          currentPassword,
          newPassword,
          confirmPassword: confirmNewPassword,
        },
        authToken
      );
      setChangePasswordMsg(res.message || 'Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      setChangePasswordError(err.message || 'Failed to change password. Please check your current password.');
    } finally {
      setChangePasswordLoading(false);
    }
  };

  // Handle Sign Out
  const handleSignOut = async () => {
    await logout();
    setCurrentUser(null);
    setAuthToken(null);
    setPassword('');
    setOtpCode('');
    setOtpSent(false);
    setOtpPreview(null);
    setShowChangePasswordSection(false);
    setSuccessMsg('You have been signed out safely. Token invalidated.');
  };

  return (
    <div className="page-wrapper theme-cyan">
      <BackgroundOrbs theme="cyan" />

      <div className="glass-container">
        <div className="glass-card">
          <div className="glass-content">
            {/* Authenticated Dashboard State */}
            {currentUser ? (
              <div className="dashboard-card">
                <div className="profile-avatar">
                  {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <h2 className="profile-name">{currentUser.fullName}</h2>
                <p className="profile-contact">
                  {currentUser.email || currentUser.phone || 'Authenticated Member'}
                </p>

                {/* Account Badges & Relational Data */}
                <div className="profile-meta-grid">
                  <div className="meta-box">
                    <div className="meta-label">Account ID</div>
                    <div className="meta-value">#{currentUser.id}</div>
                  </div>
                  <div className="meta-box">
                    <div className="meta-label">Role</div>
                    <div className="meta-value" style={{ color: '#67e8f9' }}>
                      {currentUser.role || 'ROLE_CUSTOMER'}
                    </div>
                  </div>
                  <div className="meta-box">
                    <div className="meta-label">Auth Method</div>
                    <div className="meta-value">
                      {currentUser.authPreference || authMode}
                    </div>
                  </div>
                  <div className="meta-box">
                    <div className="meta-label">Status</div>
                    <div className="meta-value" style={{ color: '#34d399' }}>
                      ● {currentUser.status || 'ACTIVE'}
                    </div>
                  </div>
                </div>

                {/* E-Commerce Navigation Hub */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', margin: '1.25rem 0' }}>
                  <button
                    type="button"
                    className="btn-action-primary"
                    style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', height: '48px', fontSize: '0.95rem' }}
                    onClick={() => navigate('/dashboard')}
                  >
                    <ShoppingBag size={18} />
                    <span>Enter E-Commerce Store</span>
                  </button>
                  <button
                    type="button"
                    className="btn-secondary-trigger"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem', height: '42px', margin: 0 }}
                    onClick={() => navigate('/cart')}
                  >
                    <ShoppingCart size={16} />
                    <span>My Cart</span>
                  </button>
                  <button
                    type="button"
                    className="btn-secondary-trigger"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem', height: '42px', margin: 0 }}
                    onClick={() => navigate('/orders')}
                  >
                    <Package size={16} />
                    <span>My Orders</span>
                  </button>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.45rem',
                    fontSize: '0.775rem',
                    color: '#94a3b8',
                    marginBottom: '1.25rem',
                  }}
                >
                  <Database size={14} style={{ color: '#22d3ee' }} />
                  <span>Verified & synced with MySQL 8.0 (ecommerce_auth_db)</span>
                </div>

                {/* Change Password Section Toggle Button */}
                <button
                  type="button"
                  className="btn-secondary-trigger"
                  onClick={() => setShowChangePasswordSection(!showChangePasswordSection)}
                  style={{ marginBottom: '1rem' }}
                >
                  <Key size={15} />
                  <span>{showChangePasswordSection ? 'Hide Change Password' : 'Change Account Password'}</span>
                </button>

                {/* Collapsible Change Password Section */}
                {showChangePasswordSection && (
                  <div className="change-password-box">
                    <h3 className="section-title">Change Password</h3>

                    {changePasswordError && (
                      <div className="alert-banner error">
                        <AlertCircle size={16} className="shrink-0" />
                        <span>{changePasswordError}</span>
                      </div>
                    )}

                    {changePasswordMsg && (
                      <div className="alert-banner success">
                        <CheckCircle2 size={16} className="shrink-0" />
                        <span>{changePasswordMsg}</span>
                      </div>
                    )}

                    <form onSubmit={handleChangePassword} noValidate>
                      <div className="form-group">
                        <label className="form-label" htmlFor="currentPassword">
                          Current Password
                        </label>
                        <div className="input-wrapper">
                          <Lock size={16} className="input-icon" />
                          <input
                            id="currentPassword"
                            type={showCurrentPassword ? 'text' : 'password'}
                            className="glass-input"
                            placeholder="Enter current password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            required
                          />
                          <button
                            type="button"
                            className="input-toggle-btn"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
                          >
                            {showCurrentPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="dashNewPassword">
                          New Password
                        </label>
                        <div className="input-wrapper">
                          <Lock size={16} className="input-icon" />
                          <input
                            id="dashNewPassword"
                            type={showNewPassword ? 'text' : 'password'}
                            className="glass-input"
                            placeholder="Min 8 chars with upper, lower, num, symbol"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                          />
                          <button
                            type="button"
                            className="input-toggle-btn"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                          >
                            {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="dashConfirmPassword">
                          Confirm New Password
                        </label>
                        <div className="input-wrapper">
                          <Lock size={16} className="input-icon" />
                          <input
                            id="dashConfirmPassword"
                            type={showConfirmNewPassword ? 'text' : 'password'}
                            className="glass-input"
                            placeholder="Re-enter new password"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            required
                          />
                          <button
                            type="button"
                            className="input-toggle-btn"
                            onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                            aria-label={showConfirmNewPassword ? 'Hide confirm password' : 'Show confirm password'}
                          >
                            {showConfirmNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                      </div>

                      {/* Visual Requirements Checklist */}
                      <PasswordRequirements
                        password={newPassword}
                        confirmPassword={confirmNewPassword}
                      />

                      <button
                        type="submit"
                        className="btn-action-primary"
                        style={{ height: '44px', fontSize: '0.875rem' }}
                        disabled={changePasswordLoading}
                      >
                        <span>{changePasswordLoading ? 'Updating Password...' : 'Update Password'}</span>
                      </button>
                    </form>
                  </div>
                )}

                {/* Sign Out Button */}
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="btn-signout"
                  style={{ marginTop: '0.75rem' }}
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              /* User Login Page Form */
              <>
                <BrandHeader
                  theme="cyan"
                  badgeText="SECURE ACCESS"
                  title="Welcome Back"
                  subtitle="Sign in to your luxury account with Password or instant OTP"
                />

                {/* Error Banner */}
                {errorMsg && (
                  <div className="alert-banner error">
                    <AlertCircle size={18} className="shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Success Banner */}
                {successMsg && (
                  <div className="alert-banner success">
                    <CheckCircle2 size={18} className="shrink-0" />
                    <span>{successMsg}</span>
                  </div>
                )}

                {/* Live OTP Demo Preview */}
                {otpPreview && authMode === 'OTP' && (
                  <div className="alert-banner otp-preview">
                    <Sparkles size={18} className="shrink-0" />
                    <div>
                      <strong>Demo Login Code:</strong>{' '}
                      <span style={{ letterSpacing: '2px', fontWeight: 'bold' }}>{otpPreview}</span>
                      <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>
                        Generated & stored in MySQL <code>otp_verifications</code>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                  {/* Field 1: Identifier Input (Supports Email or Phone with Auto-Detection) */}
                  <div className="form-group">
                    <div className="form-label">
                      <label htmlFor="loginIdentifier">Email or Phone Number</label>
                      {detectedType && (
                        <span className="form-badge-detect">
                          Detected: {detectedType}
                        </span>
                      )}
                    </div>
                    <div className="input-wrapper">
                      {detectedType === 'Phone Number' ? (
                        <Phone size={18} className="input-icon" />
                      ) : (
                        <Mail size={18} className="input-icon" />
                      )}
                      <input
                        id="loginIdentifier"
                        type="text"
                        className="glass-input"
                        placeholder="prashant@aurastore.com or +1 (555) 000-0000"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        autoComplete="username"
                        required
                      />
                    </div>
                  </div>

                  {/* Field 2: Authentication Switch (Password vs OTP Code) */}
                  <div className="switch-container">
                    <button
                      type="button"
                      className={`switch-button ${authMode === 'PASSWORD' ? 'active' : ''}`}
                      onClick={() => {
                        setAuthMode('PASSWORD');
                        setErrorMsg('');
                      }}
                    >
                      <Lock size={15} />
                      <span>Password</span>
                    </button>
                    <button
                      type="button"
                      className={`switch-button ${authMode === 'OTP' ? 'active' : ''}`}
                      onClick={() => {
                        setAuthMode('OTP');
                        setErrorMsg('');
                      }}
                    >
                      <KeyRound size={15} />
                      <span>OTP Code</span>
                    </button>
                  </div>

                  {/* Mode 1: Password Login */}
                  {authMode === 'PASSWORD' && (
                    <div className="form-group">
                      <label className="form-label" htmlFor="loginPassword">
                        Password
                      </label>
                      <div className="input-wrapper">
                        <Lock size={18} className="input-icon" />
                        <input
                          id="loginPassword"
                          type={showPassword ? 'text' : 'password'}
                          className="glass-input"
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          autoComplete="current-password"
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

                      {/* Forgot Password Link */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.45rem' }}>
                        <Link to="/forgot-password" className="nav-link-glow" style={{ fontSize: '0.8rem' }}>
                          Forgot Password?
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Mode 2: OTP Login */}
                  {authMode === 'OTP' && (
                    <div className="otp-container">
                      {!otpSent ? (
                        <button
                          type="button"
                          className="btn-secondary-trigger"
                          onClick={handleSendOtp}
                          disabled={loading || !identifier.trim()}
                        >
                          <KeyRound size={16} />
                          <span>{loading ? 'Dispatching OTP...' : 'Send 6-Digit OTP'}</span>
                        </button>
                      ) : (
                        <>
                          <div className="form-label" style={{ marginBottom: '0.65rem' }}>
                            <span>Enter 6-Digit OTP</span>
                            <span className="otp-timer">
                              <Clock size={13} />
                              {timer > 0 ? (
                                <span className="otp-timer-count">00:{timer < 10 ? `0${timer}` : timer}s</span>
                              ) : (
                                <span style={{ color: '#f87171' }}>Expired</span>
                              )}
                            </span>
                          </div>

                          <OtpInput
                            value={otpCode}
                            onChange={setOtpCode}
                            disabled={loading}
                            theme="cyan"
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

                  {/* Log In Button with glowing hover shine animation */}
                  <button
                    type="submit"
                    className="btn-action-primary"
                    disabled={loading}
                  >
                    <span>{loading ? 'Authenticating...' : 'Log In'}</span>
                    {!loading && <ArrowRight size={18} />}
                  </button>
                </form>

                {/* Navigation Link at bottom: Don't have an account? Sign Up */}
                <div className="card-footer">
                  <span>Don't have an account?</span>
                  <Link to="/signup" className="nav-link-glow">
                    Sign Up
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
