import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { getAdminOrders, updateAdminOrderStatus } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ShoppingBag, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

export default function AdminOrders() {
  const { authToken } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAdminOrders({ size: 50 }, authToken);
      setOrders(data?.content || []);
    } catch (err) {
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [authToken]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateAdminOrderStatus(orderId, newStatus, authToken);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, orderStatus: newStatus } : o))
      );
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const formatPrice = (val) => {
    if (val === undefined || val === null) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const filtered = statusFilter
    ? orders.filter((o) => o.orderStatus === statusFilter)
    : orders;

  return (
    <AdminLayout title="Order Lifecycle & Dispatch Management">
      <div className="admin-table-container">
        <div className="admin-table-header">
          <div>
            <h3 className="admin-table-title">All Customer Orders ({orders.length})</h3>
            <span style={{ fontSize: '0.85rem', color: '#64748B' }}>
              Update dispatch and delivery statuses in real-time
            </span>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '0.85rem',
                backgroundColor: '#FFFFFF',
              }}
            >
              <option value="">All Statuses</option>
              <option value="ORDER_PLACED">ORDER PLACED</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="SHIPPED">SHIPPED</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>

            <button onClick={fetchOrders} className="admin-btn admin-btn-outline" title="Refresh">
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748B' }}>
            Retrieving customer orders...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748B' }}>
            No orders match the selected filter.
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Customer</th>
                <th>Total Value</th>
                <th>Payment Mode</th>
                <th>Date</th>
                <th>Current Status</th>
                <th>Update Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ord) => (
                <tr key={ord.id}>
                  <td style={{ fontWeight: 600, fontFamily: 'monospace' }}>
                    #{ord.orderNumber || ord.id}
                  </td>
                  <td>{ord.customerName || 'Customer'}</td>
                  <td style={{ fontWeight: 600 }}>{formatPrice(ord.totalAmount)}</td>
                  <td>
                    <span className="admin-badge admin-badge-blue">
                      {ord.paymentMethod || 'COD'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: '#64748B' }}>
                    {ord.createdAt
                      ? new Date(ord.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                        })
                      : 'Recent'}
                  </td>
                  <td>
                    <span
                      className={`admin-badge ${
                        ord.orderStatus === 'DELIVERED'
                          ? 'admin-badge-success'
                          : ord.orderStatus === 'CANCELLED'
                          ? 'admin-badge-danger'
                          : 'admin-badge-warning'
                      }`}
                    >
                      {ord.orderStatus}
                    </span>
                  </td>
                  <td>
                    <select
                      value={ord.orderStatus}
                      onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        border: '1px solid #CBD5E1',
                        fontSize: '0.8rem',
                        backgroundColor: '#FFFFFF',
                      }}
                    >
                      <option value="ORDER_PLACED">PLACED</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
}
