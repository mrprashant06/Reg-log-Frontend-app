import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import BackgroundOrbs from '../components/BackgroundOrbs';
import BrandHeader from '../components/BrandHeader';
import OtpInput from '../components/OtpInput';
import PasswordRequirements from '../components/PasswordRequirements';
import { forgotPassword, verifyOtp, resetPasswordWithOtp } from '../services/api';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  // Wizard Steps: 1: Identifier -> 2: OTP -> 3: New Password
  const [step, setStep] = useState(1);

  // Form Fields
  const [identifier, setIdentifier] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP Timer State
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [otpPreview, setOtpPreview] = useState(null);

  // UI Feedback
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 60-second timer countdown
  useEffect(() => {
    let interval = null;
    if (step >= 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Step 1: Request Password Reset OTP
  const handleSendResetOtp = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!identifier.trim()) {
      setErrorMsg('Please enter your registered Email Address or Mobile Number.');
      return;
    }

    try {
      setLoading(true);
      const res = await forgotPassword(identifier.trim());
      setStep(2);
      setTimer(60);
      setCanResend(false);
      setOtpCode('');
      setOtpPreview(res.otp || null);
      setSuccessMsg(res.message || `Password reset code sent to ${identifier}`);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to dispatch reset code. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (otpCode.length !== 6) {
      setErrorMsg('Please enter the complete 6-digit OTP code.');
      return;
    }

    try {
      setLoading(true);
      await verifyOtp(identifier.trim(), otpCode, 'PASSWORD_RESET');
      setStep(3);
      setSuccessMsg('OTP verified successfully! Please enter your new password.');
    } catch (err) {
      setErrorMsg(err.message || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset / Restart Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (newPassword.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setErrorMsg('Password must include at least one uppercase letter (A-Z).');
      return;
    }
    if (!/[a-z]/.test(newPassword)) {
      setErrorMsg('Password must include at least one lowercase letter (a-z).');
      return;
    }
    if (!/\d/.test(newPassword)) {
      setErrorMsg('Password must include at least one numeric digit (0-9).');
      return;
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
      setErrorMsg('Password must include at least one special character (!@#$%^&* etc.).');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify your re-entered password.');
      return;
    }

    try {
      setLoading(true);
      const res = await resetPasswordWithOtp({
        identifier: identifier.trim(),
        otpCode,
        newPassword,
        confirmPassword,
      });

      try {
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#8b5cf6', '#d946ef', '#10b981', '#ffffff'],
        });
      } catch {
        // Fallback
      }

      setSuccessMsg(res.message || 'Password reset successfully! Redirecting to login...');

      setTimeout(() => {
        navigate('/login', {
          state: {
            prefillIdentifier: identifier.trim(),
            justReset: true,
          },
        });
      }, 1600);
    } catch (err) {
      setErrorMsg(err.message || 'Password reset failed. Please check inputs.');
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
            <BrandHeader
              theme="violet"
              badgeText="ACCOUNT RECOVERY"
              title="Reset Password"
              subtitle="Secure two-factor verification to restart your account password"
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

            {/* Live OTP Preview for Demo Testing */}
            {otpPreview && step === 2 && (
              <div className="alert-banner otp-preview">
                <Sparkles size={18} className="shrink-0" />
                <div>
                  <strong>Password Reset Code:</strong>{' '}
                  <span style={{ letterSpacing: '2px', fontWeight: 'bold' }}>{otpPreview}</span>
                  <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>
                    Generated & saved in MySQL table <code>otp_verifications</code>
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Identifier Input */}
            {step === 1 && (
              <form onSubmit={handleSendResetOtp} noValidate>
                <div className="form-group">
                  <label className="form-label" htmlFor="forgotIdentifier">
                    Registered Email or Mobile Number
                  </label>
                  <div className="input-wrapper">
                    {identifier.includes('@') ? (
                      <Mail size={18} className="input-icon" />
                    ) : (
                      <Phone size={18} className="input-icon" />
                    )}
                    <input
                      id="forgotIdentifier"
                      type="text"
                      className="glass-input"
                      placeholder="prashant@aurastore.com or +1 555-000-0000"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      autoComplete="username"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-action-primary"
                  disabled={loading || !identifier.trim()}
                >
                  <span>{loading ? 'Validating Account...' : 'Send Verification OTP'}</span>
                  {!loading && <ArrowRight size={18} />}
                </button>
              </form>
            )}

            {/* Step 2: 6-Digit OTP Verification */}
            {step === 2 && (
              <form onSubmit={handleVerifyOtp} noValidate>
                <div className="otp-container">
                  <div className="form-label" style={{ marginBottom: '0.65rem' }}>
                    <span>Enter 6-Digit Code</span>
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
                    theme="violet"
                  />

                  <div className="otp-actions-bar">
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      Sent to {identifier}
                    </span>
                    <button
                      type="button"
                      className="btn-inline-otp"
                      onClick={handleSendResetOtp}
                      disabled={loading || !canResend}
                    >
                      <RotateCcw size={13} />
                      <span>Resend Code</span>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-action-primary"
                  disabled={loading || otpCode.length !== 6}
                >
                  <span>{loading ? 'Verifying Code...' : 'Verify & Continue'}</span>
                  {!loading && <ArrowRight size={18} />}
                </button>
              </form>
            )}

            {/* Step 3: Enter & Confirm New Password */}
            {step === 3 && (
              <form onSubmit={handleResetPassword} noValidate>
                <div className="form-group">
                  <label className="form-label" htmlFor="newPassword">
                    New Password
                  </label>
                  <div className="input-wrapper">
                    <Lock size={18} className="input-icon" />
                    <input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      className="glass-input"
                      placeholder="Enter new strong password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      className="input-toggle-btn"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="confirmPassword">
                    Confirm New Password
                  </label>
                  <div className="input-wrapper">
                    <Lock size={18} className="input-icon" />
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="glass-input"
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      className="input-toggle-btn"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Live Password Security Requirements Visual Checklist */}
                <PasswordRequirements
                  password={newPassword}
                  confirmPassword={confirmPassword}
                />

                <button
                  type="submit"
                  className="btn-action-primary"
                  disabled={loading}
                >
                  <span>{loading ? 'Updating Password...' : 'Save New Password'}</span>
                  {!loading && <ArrowRight size={18} />}
                </button>
              </form>
            )}

            {/* Back to Login Footer */}
            <div className="card-footer">
              <span>Remembered your password?</span>
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
