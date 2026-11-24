import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import CustomerHeader from '../components/CustomerHeader';
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
  Key,
  LogOut,
  X,
  Check,
} from 'lucide-react';

export default function Profile() {
  const { user, authToken, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Address modal/form
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    fullName: user?.fullName || '',
    mobileNumber: user?.phone || '',
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

    async function loadProfileData() {
      try {
        setLoading(true);
        const addrs = await getAddresses(authToken);
        setAddresses(addrs || []);
      } catch (err) {
        console.error('Failed to load profile addresses:', err);
      } finally {
        setLoading(false);
      }
    }

    loadProfileData();
  }, [isAuthenticated, authToken, navigate]);

  const handleOpenNewAddress = () => {
    setEditingAddressId(null);
    setAddressForm({
      fullName: user?.fullName || '',
      mobileNumber: user?.phone || '',
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
    if (newPassword !== confirmPassword) {
      setPwError('New passwords do not match');
      return;
    }
    try {
      setPwLoading(true);
      setPwError('');
      setPwSuccess('');
      await changePassword({ currentPassword, newPassword, confirmPassword }, authToken);
      setPwSuccess('Password successfully updated');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPwSuccess(''), 4000);
    } catch (err) {
      setPwError(err.message || 'Failed to update password');
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', color: '#111111' }}>
      <CustomerHeader />

      <main style={{ maxWidth: '1200px', margin: '3rem auto 6rem auto', padding: '0 2rem' }}>
        {/* User Card */}
        <div
          style={{
            backgroundColor: '#F7F7F7',
            border: '1px solid #E5E5E5',
            padding: '2.5rem',
            marginBottom: '3rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                backgroundColor: '#111111',
                color: '#FFFFFF',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 300,
              }}
            >
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'A'}
            </div>
            <div>
              <span className="aura-title-sub">PERSONAL ACCOUNT</span>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 400, margin: '0.2rem 0' }}>
                {user?.fullName || 'Customer'}
              </h1>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#707070' }}>
                {user?.email || user?.phone}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Link to="/orders" className="aura-btn aura-btn-secondary" style={{ padding: '0.65rem 1.25rem', fontSize: '0.72rem' }}>
              MY ORDERS
            </Link>
            <button
              onClick={logout}
              className="aura-btn aura-btn-secondary"
              style={{ padding: '0.65rem 1.25rem', fontSize: '0.72rem', borderColor: '#C62828', color: '#C62828' }}
            >
              <LogOut size={14} /> SIGN OUT
            </button>
          </div>
        </div>

        {/* 2 Columns: Addresses and Password */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.9fr', gap: '3.5rem', alignItems: 'start' }}>
          {/* Left Column: Address Book */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #E5E5E5', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '0.85rem', letterSpacing: '0.12em', textTransform: 'uppercase', margin: 0 }}>
                DELIVERY ADDRESS BOOK ({addresses.length})
              </h3>
              <button
                onClick={handleOpenNewAddress}
                className="aura-btn aura-btn-secondary"
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.7rem' }}
              >
                <Plus size={13} /> ADD ADDRESS
              </button>
            </div>

            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#707070', fontSize: '0.82rem' }}>
                Loading addresses...
              </div>
            ) : addresses.length === 0 ? (
              <div style={{ padding: '2.5rem', backgroundColor: '#F7F7F7', textAlign: 'center', fontSize: '0.82rem', color: '#707070' }}>
                No delivery addresses registered.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    style={{
                      padding: '1.25rem',
                      border: addr.isDefault ? '2px solid #111111' : '1px solid #E5E5E5',
                      backgroundColor: '#FFFFFF',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.4rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                        {addr.fullName}
                      </span>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {addr.isDefault ? (
                          <span style={{ fontSize: '0.65rem', backgroundColor: '#111111', color: '#FFFFFF', padding: '2px 8px', letterSpacing: '0.05em' }}>
                            DEFAULT
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSetDefault(addr.id)}
                            style={{ background: 'none', border: 'none', fontSize: '0.7rem', color: '#707070', textDecoration: 'underline', cursor: 'pointer' }}
                          >
                            Set Default
                          </button>
                        )}
                        <button
                          onClick={() => handleEditAddress(addr)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#111111' }}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(addr.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C62828' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#707070', lineHeight: 1.5, margin: 0 }}>
                      {addr.streetAddress}, {addr.city}, {addr.state} - {addr.postalCode}
                    </p>
                    <span style={{ fontSize: '0.75rem', color: '#111111' }}>
                      Tel: {addr.mobileNumber}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Change Password */}
          <div style={{ backgroundColor: '#F7F7F7', border: '1px solid #E5E5E5', padding: '2rem' }}>
            <h3 style={{ fontSize: '0.85rem', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 1.5rem 0' }}>
              SECURITY & PASSWORD
            </h3>

            {pwSuccess && (
              <div style={{ padding: '0.75rem', backgroundColor: '#DEF7EC', color: '#03543F', fontSize: '0.78rem', marginBottom: '1rem' }}>
                {pwSuccess}
              </div>
            )}

            {pwError && (
              <div style={{ padding: '0.75rem', backgroundColor: '#FDE8E8', color: '#C62828', fontSize: '0.78rem', marginBottom: '1rem' }}>
                {pwError}
              </div>
            )}

            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#707070', display: 'block', marginBottom: '4px' }}>
                  CURRENT PASSWORD
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  style={{ width: '100%', padding: '0.7rem', fontSize: '0.8rem', border: '1px solid #E5E5E5', backgroundColor: '#FFFFFF', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#707070', display: 'block', marginBottom: '4px' }}>
                  NEW PASSWORD
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ width: '100%', padding: '0.7rem', fontSize: '0.8rem', border: '1px solid #E5E5E5', backgroundColor: '#FFFFFF', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#707070', display: 'block', marginBottom: '4px' }}>
                  CONFIRM NEW PASSWORD
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ width: '100%', padding: '0.7rem', fontSize: '0.8rem', border: '1px solid #E5E5E5', backgroundColor: '#FFFFFF', outline: 'none' }}
                />
              </div>

              <button
                type="submit"
                disabled={pwLoading}
                className="aura-btn aura-btn-primary aura-btn-full"
                style={{ padding: '0.85rem', fontSize: '0.75rem', marginTop: '0.5rem' }}
              >
                {pwLoading ? 'UPDATING...' : 'UPDATE PASSWORD'}
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Address Edit/Add Modal */}
      {showAddressModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '1rem',
          }}
          onClick={() => setShowAddressModal(false)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              maxWidth: '520px',
              width: '100%',
              padding: '2.5rem',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>
                {editingAddressId ? 'EDIT ADDRESS' : 'NEW DELIVERY ADDRESS'}
              </h3>
              <button onClick={() => setShowAddressModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input
                type="text"
                required
                placeholder="FULL NAME"
                value={addressForm.fullName}
                onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                style={{ padding: '0.75rem', fontSize: '0.8rem', border: '1px solid #E5E5E5', outline: 'none' }}
              />
              <input
                type="tel"
                required
                placeholder="MOBILE NUMBER"
                value={addressForm.mobileNumber}
                onChange={(e) => setAddressForm({ ...addressForm, mobileNumber: e.target.value })}
                style={{ padding: '0.75rem', fontSize: '0.8rem', border: '1px solid #E5E5E5', outline: 'none' }}
              />
              <input
                type="text"
                required
                placeholder="STREET ADDRESS"
                value={addressForm.streetAddress}
                onChange={(e) => setAddressForm({ ...addressForm, streetAddress: e.target.value })}
                style={{ padding: '0.75rem', fontSize: '0.8rem', border: '1px solid #E5E5E5', outline: 'none' }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <input
                  type="text"
                  required
                  placeholder="CITY"
                  value={addressForm.city}
                  onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                  style={{ padding: '0.75rem', fontSize: '0.8rem', border: '1px solid #E5E5E5', outline: 'none' }}
                />
                <input
                  type="text"
                  required
                  placeholder="STATE"
                  value={addressForm.state}
                  onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                  style={{ padding: '0.75rem', fontSize: '0.8rem', border: '1px solid #E5E5E5', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <input
                  type="text"
                  required
                  placeholder="POSTAL CODE"
                  value={addressForm.postalCode}
                  onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                  style={{ padding: '0.75rem', fontSize: '0.8rem', border: '1px solid #E5E5E5', outline: 'none' }}
                />
                <select
                  value={addressForm.addressType}
                  onChange={(e) => setAddressForm({ ...addressForm, addressType: e.target.value })}
                  style={{ padding: '0.75rem', fontSize: '0.8rem', border: '1px solid #E5E5E5', outline: 'none', backgroundColor: '#FFFFFF' }}
                >
                  <option value="HOME">HOME</option>
                  <option value="WORK">WORK</option>
                  <option value="OTHER">OTHER</option>
                </select>
              </div>

              <button type="submit" className="aura-btn aura-btn-primary aura-btn-full" style={{ marginTop: '1rem', padding: '0.85rem' }}>
                SAVE ADDRESS
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
