import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  changePassword,
} from '../services/api';
import PasswordRequirements from '../components/PasswordRequirements';
import {
  User,
  MapPin,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Key,
  ShieldCheck,
  Star,
  Home,
  LogOut,
  Loader2,
} from 'lucide-react';

export default function Profile() {
  const { currentUser, authToken, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Address modal/form
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    fullName: currentUser?.fullName || '',
    mobileNumber: currentUser?.phone || '',
    streetAddress: '',
    apartmentSuite: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    addressType: 'HOME',
    isDefault: false,
  });

  // Change password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError, setPwError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/profile' } });
      return;
    }

    async function loadUserAddresses() {
      try {
        setLoading(true);
        const data = await getAddresses(authToken);
        setAddresses(data);
      } catch (err) {
        console.error('Failed to load addresses:', err);
      } finally {
        setLoading(false);
      }
    }
    loadUserAddresses();
  }, [isAuthenticated, authToken, navigate]);

  const handleOpenNewAddress = () => {
    setEditingAddressId(null);
    setAddressForm({
      fullName: currentUser?.fullName || '',
      mobileNumber: currentUser?.phone || '',
      streetAddress: '',
      apartmentSuite: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
      addressType: 'HOME',
      isDefault: false,
    });
    setShowAddressModal(true);
  };

  const handleEditAddress = (addr) => {
    setEditingAddressId(addr.id);
    setAddressForm({
      fullName: addr.fullName || '',
      mobileNumber: addr.mobileNumber || '',
      streetAddress: addr.streetAddress || '',
      apartmentSuite: addr.apartmentSuite || '',
      city: addr.city || '',
      state: addr.state || '',
      postalCode: addr.postalCode || '',
      country: addr.country || 'India',
      addressType: addr.addressType || 'HOME',
      isDefault: addr.isDefault || false,
    });
    setShowAddressModal(true);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      if (editingAddressId) {
        const updated = await updateAddress(editingAddressId, addressForm, authToken);
        setAddresses((prev) => prev.map((a) => (a.id === editingAddressId ? updated : a)));
      } else {
        const created = await addAddress(addressForm, authToken);
        setAddresses((prev) => [...prev, created]);
      }
      setShowAddressModal(false);
    } catch (err) {
      alert(err.message || 'Failed to save address');
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Delete this delivery address?')) return;
    try {
      await deleteAddress(id, authToken);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete address');
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await setDefaultAddress(id, authToken);
      setAddresses((prev) =>
        prev.map((a) => ({
          ...a,
          isDefault: a.id === id,
        }))
      );
    } catch (err) {
      alert(err.message || 'Failed to set default address');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');

    if (newPassword !== confirmPassword) {
      setPwError('New password and confirmation do not match');
      return;
    }

    try {
      setPwLoading(true);
      const res = await changePassword(
        { currentPassword, newPassword, confirmPassword },
        authToken
      );
      setPwSuccess(res.message || 'Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPwError(err.message || 'Failed to change password');
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#070b14', color: '#ffffff' }}>
      <Navbar />

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 1.25rem 5rem' }}>
        {/* Profile Card Header */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px',
            padding: '2rem',
            backdropFilter: 'blur(20px)',
            marginBottom: '2.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.85rem',
                fontWeight: 800,
                color: '#ffffff',
                boxShadow: '0 0 30px rgba(6, 182, 212, 0.4)',
              }}
            >
              {currentUser?.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#06b6d4', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1px' }}>
                Customer Account #{currentUser?.id}
              </div>
              <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.75rem', fontWeight: 800, margin: '0.2rem 0' }}>
                {currentUser?.fullName}
              </h1>
              <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                {currentUser?.email || currentUser?.phone}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.6rem 1.25rem',
              borderRadius: '10px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: '#f87171',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>

        {/* 2-Column Sections: Address Book & Password Update */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2.5rem' }}>
          {/* Left Column: Address Book */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', fontWeight: 700 }}>
                <MapPin size={20} style={{ color: '#06b6d4' }} />
                <span>Delivery Address Book</span>
              </div>

              <button
                type="button"
                onClick={handleOpenNewAddress}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '8px',
                  background: 'rgba(6, 182, 212, 0.15)',
                  border: '1px solid rgba(6, 182, 212, 0.35)',
                  color: '#22d3ee',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Plus size={14} />
                <span>Add Address</span>
              </button>
            </div>

            {loading ? (
              <div style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>Loading addresses...</div>
            ) : addresses.length === 0 ? (
              <div
                style={{
                  padding: '2rem',
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px dashed rgba(255, 255, 255, 0.1)',
                  textAlign: 'center',
                  color: '#94a3b8',
                }}
              >
                No addresses added yet. Add an address for 1-click checkout.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    style={{
                      padding: '1.25rem',
                      borderRadius: '16px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: addr.isDefault ? '2px solid #06b6d4' : '1px solid rgba(255, 255, 255, 0.08)',
                      backdropFilter: 'blur(10px)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.4rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <strong style={{ fontSize: '0.95rem', color: '#ffffff' }}>
                          {addr.fullName || currentUser?.fullName}
                        </strong>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '9999px',
                            background: 'rgba(255, 255, 255, 0.08)',
                            color: '#94a3b8',
                            fontWeight: 600,
                          }}
                        >
                          {addr.addressType}
                        </span>
                        {addr.isDefault && (
                          <span
                            style={{
                              fontSize: '0.7rem',
                              padding: '0.15rem 0.5rem',
                              borderRadius: '9999px',
                              background: 'rgba(6, 182, 212, 0.2)',
                              color: '#22d3ee',
                              fontWeight: 700,
                            }}
                          >
                            Default
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          type="button"
                          onClick={() => handleEditAddress(addr)}
                          style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                          title="Edit"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteAddress(addr.id)}
                          style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: '4px' }}
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                      {addr.apartmentSuite ? `${addr.apartmentSuite}, ` : ''}{addr.streetAddress}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                      {addr.city}, {addr.state} - {addr.postalCode}, {addr.country}
                    </div>

                    {!addr.isDefault && (
                      <button
                        type="button"
                        onClick={() => handleSetDefault(addr.id)}
                        style={{
                          alignSelf: 'flex-start',
                          background: 'none',
                          border: 'none',
                          color: '#06b6d4',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          padding: 0,
                          marginTop: '0.4rem',
                        }}
                      >
                        Set as Default Address
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Change Account Password */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem' }}>
              <Key size={20} style={{ color: '#06b6d4' }} />
              <span>Security & Password</span>
            </div>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
                padding: '1.75rem',
                backdropFilter: 'blur(20px)',
              }}
            >
              {pwSuccess && (
                <div style={{ padding: '0.75rem 1rem', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', marginBottom: '1rem', fontSize: '0.85rem' }}>
                  {pwSuccess}
                </div>
              )}
              {pwError && (
                <div style={{ padding: '0.75rem 1rem', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', marginBottom: '1rem', fontSize: '0.85rem' }}>
                  {pwError}
                </div>
              )}

              <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.825rem', color: '#cbd5e1', fontWeight: 600 }}>Current Password</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    style={profileInputStyle}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.825rem', color: '#cbd5e1', fontWeight: 600 }}>New Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={profileInputStyle}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.825rem', color: '#cbd5e1', fontWeight: 600 }}>Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={profileInputStyle}
                  />
                </div>

                <PasswordRequirements password={newPassword} confirmPassword={confirmPassword} />

                <button
                  type="submit"
                  disabled={pwLoading}
                  style={{
                    height: '44px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #06b6d4, #2563eb)',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    marginTop: '0.5rem',
                  }}
                >
                  {pwLoading ? 'Updating Password...' : 'Update Password'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Address Edit/Create Modal */}
      {showAddressModal && (
        <div style={modalOverlayStyle}>
          <div style={modalBoxStyle}>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.35rem', fontWeight: 800, marginBottom: '1.25rem' }}>
              {editingAddressId ? 'Edit Delivery Address' : 'Add New Address'}
            </h3>

            <form onSubmit={handleSaveAddress} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Full Name *</label>
                  <input
                    type="text"
                    required
                    value={addressForm.fullName}
                    onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                    style={profileInputStyle}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={addressForm.mobileNumber}
                    onChange={(e) => setAddressForm({ ...addressForm, mobileNumber: e.target.value })}
                    style={profileInputStyle}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>House/Flat/Apartment</label>
                <input
                  type="text"
                  placeholder="e.g. 102 Crystal Heights"
                  value={addressForm.apartmentSuite}
                  onChange={(e) => setAddressForm({ ...addressForm, apartmentSuite: e.target.value })}
                  style={profileInputStyle}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Street Address *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Park Street"
                  value={addressForm.streetAddress}
                  onChange={(e) => setAddressForm({ ...addressForm, streetAddress: e.target.value })}
                  style={profileInputStyle}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>City *</label>
                  <input
                    type="text"
                    required
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    style={profileInputStyle}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>State *</label>
                  <input
                    type="text"
                    required
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    style={profileInputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>PIN Code *</label>
                  <input
                    type="text"
                    required
                    value={addressForm.postalCode}
                    onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                    style={profileInputStyle}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Address Type</label>
                  <select
                    value={addressForm.addressType}
                    onChange={(e) => setAddressForm({ ...addressForm, addressType: e.target.value })}
                    style={{ ...profileInputStyle, cursor: 'pointer' }}
                  >
                    <option value="HOME" style={{ background: '#0f172a' }}>Home</option>
                    <option value="OFFICE" style={{ background: '#0f172a' }}>Office / Work</option>
                    <option value="OTHER" style={{ background: '#0f172a' }}>Other</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  style={{
                    flex: 1,
                    padding: '0.65rem',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#cbd5e1',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '0.65rem',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #06b6d4, #2563eb)',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const profileInputStyle = {
  width: '100%',
  padding: '0.55rem 0.75rem',
  borderRadius: '8px',
  background: 'rgba(255, 255, 255, 0.08)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  color: '#ffffff',
  fontSize: '0.85rem',
  outline: 'none',
  marginTop: '0.25rem',
};

const modalOverlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(7, 11, 20, 0.85)',
  backdropFilter: 'blur(16px)',
  zIndex: 1000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '1.25rem',
};

const modalBoxStyle = {
  width: '100%',
  maxWidth: '520px',
  background: '#0f172a',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  borderRadius: '24px',
  padding: '2rem',
  boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)',
};
