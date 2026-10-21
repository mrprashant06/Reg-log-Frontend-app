/**
 * AURA LUXE API Service
 * Interacts with Spring Boot Backend (Java 21 + MySQL 8.0)
 */

const API_BASE = '/api/auth';

/**
 * Send 6-digit OTP to Email or Phone identifier
 */
export async function sendOtp(identifier, purpose = 'REGISTRATION') {
  const response = await fetch(`${API_BASE}/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, purpose }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to dispatch verification code');
  }
  return data;
}

/**
 * Verify 6-digit OTP code
 */
export async function verifyOtp(identifier, otpCode, purpose = 'REGISTRATION') {
  const response = await fetch(`${API_BASE}/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, otpCode, purpose }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Invalid or expired OTP code');
  }
  return data;
}

/**
 * Register user in MySQL database
 */
export async function registerUser({ fullName, identifier, authPreference, password, confirmPassword, otpCode }) {
  const response = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName,
      identifier,
      authPreference,
      password: authPreference === 'PASSWORD' ? password : null,
      confirmPassword: authPreference === 'PASSWORD' ? confirmPassword : null,
      otpCode: authPreference === 'OTP' ? otpCode : null,
    }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Registration failed');
  }
  return data;
}

/**
 * Login user via Password or OTP
 */
export async function loginUser({ identifier, authMode, password, otpCode }) {
  const response = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier,
      authMode,
      password: authMode === 'PASSWORD' ? password : null,
      otpCode: authMode === 'OTP' ? otpCode : null,
    }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Authentication failed');
  }
  return data;
}

/**
 * Fetch authenticated user profile
 */
export async function getProfile(token) {
  const response = await fetch(`${API_BASE}/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Unable to retrieve user session');
  }
  return data;
}

/**
 * Logout
 */
export async function logoutUser() {
  try {
    await fetch(`${API_BASE}/logout`, { method: 'POST' });
  } catch {
    // Ignore network drop on signout
  }
}
