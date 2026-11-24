import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Store,
  LogOut,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/admin-theme.css';

export default function AdminLayout({ children, title = 'Dashboard Overview' }) {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'Products & Inventory', path: '/admin/products', icon: Package },
    { label: 'Order Management', path: '/admin/orders', icon: ShoppingBag },
  ];

  return (
    <div className="admin-portal">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-brand-icon">A</div>
          <div className="admin-brand-text">
            AURA <span>Admin</span>
          </div>
        </div>

        <nav className="admin-nav-menu">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`admin-nav-link ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div style={{ marginTop: 'auto', borderTop: '1px solid #E2E8F0', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <Link to="/" className="admin-nav-link">
              <Store size={18} />
              <span>Customer Storefront</span>
            </Link>
            <button
              onClick={logout}
              className="admin-nav-link"
              style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', color: '#EF4444' }}
            >
              <LogOut size={18} />
              <span>Log Out</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Body */}
      <div className="admin-main">
        <header className="admin-topbar">
          <h1 className="admin-topbar-title">{title}</h1>
          <div className="admin-topbar-actions">
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0F172A' }}>
              {user?.fullName || 'Administrator'}
            </span>
            <span className="admin-badge admin-badge-blue">
              ADMIN
            </span>
          </div>
        </header>

        <div className="admin-container">
          {children}
        </div>
      </div>
    </div>
  );
}
