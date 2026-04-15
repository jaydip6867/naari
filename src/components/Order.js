import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar.js';
import '../styles.css';
import { storage } from '../utils/storage';
import { orderAPI } from '../services/api';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiEye, FiPackage } from 'react-icons/fi';

const Order = ({ onLogout }) => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchOrders = async (search = '') => {
    try {
      setLoading(true);
      setError('');
      const response = await orderAPI.getOrders(search);
      setOrders(Array.isArray(response) ? response : (response || []));
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchOrders(searchQuery);
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) {
      return;
    }

    try {
      setLoading(true);
      await orderAPI.deleteOrder(orderId);
      fetchOrders(searchQuery);
    } catch (err) {
      console.error('Error deleting order:', err);
      alert(err.message || 'Failed to delete order');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    storage.clearAuthData();
    onLogout();
    navigate('/');
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      'pending': { background: '#fef3c7', color: '#92400e' },
      'in-progress': { background: '#dbeafe', color: '#1e40af' },
      'completed': { background: '#d1fae5', color: '#065f46' },
      'cancelled': { background: '#fee2e2', color: '#991b1b' }
    };
    const style = statusStyles[status?.toLowerCase()] || statusStyles['pending'];
    return (
      <span style={{ ...style, padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '500', textTransform: 'capitalize' }}>
        {status || 'Pending'}
      </span>
    );
  };

  return (
    <div className="settings-container">
      <Sidebar onLogout={handleLogout} />

      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">Order Management</h1>
        </div>

        <div className="content-section">
          <div className="section-header" style={{ flexWrap: 'wrap', gap: '16px' }}>
            <h2 className="section-title">Orders</h2>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', flex: 1, justifyContent: 'flex-end' }}>
              <div className="search-container" style={{ position: 'relative' }}>
                <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-color)' }} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={handleSearch}
                  style={{
                    padding: '8px 12px 8px 36px',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '14px',
                    width: '200px'
                  }}
                />
              </div>
              <button
                className="add-btn"
                onClick={() => navigate('/orders/add')}
              >
                <FiPlus /> Add Order
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              color: 'var(--alert-color)',
              background: 'rgba(255, 0, 0, 0.1)',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '16px',
              border: '1px solid rgba(255, 0, 0, 0.2)'
            }}>
              {error}
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--primary-color)' }}>
              Loading orders...
            </div>
          ) : orders.length > 0 ? (
            <div className="table-container" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--background-light)', borderBottom: '2px solid var(--border-color)' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--primary-dark)' }}>Image</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--primary-dark)' }}>Order ID</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--primary-dark)' }}>Customer</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--primary-dark)' }}>Order Type</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--primary-dark)' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--primary-dark)' }}>Delivery Date</th>
                    <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: 'var(--primary-dark)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, index) => (
                    <tr key={order._id || index} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px' }}>
                        <div style={{ width: '50px', height: '50px', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background-light)', border: '1px solid var(--border-color)' }}>
                          {order.outfitStyleRefImg && order.outfitStyleRefImg.length > 0 ? (
                            <img
                              src={order.outfitStyleRefImg[0]}
                              alt={order._id}
                              style={{ width: '100%', height: '100%' }}
                            />
                          ) : (
                            <FiPackage size={24} color="var(--gray-color)" />
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '12px' }}>{order._id?.slice(-6) || '-'}</td>
                      <td style={{ padding: '12px' }}>
                        {typeof order.customerId === 'object' && order.customerId !== null
                          ? (order.customerId.fullName || order.customerId.name || '-')
                          : (order.customerId || '-')}
                      </td>
                      <td style={{ padding: '12px', textTransform: 'capitalize' }}>{order.orderType || '-'}</td>
                      <td style={{ padding: '12px' }}>{getStatusBadge(order.status)}</td>
                      <td style={{ padding: '12px' }}>{order.deliveryDate || '-'}</td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button
                            className="edit-btn"
                            onClick={() => navigate(`/orders/view/${order._id}`)}
                            title="View"
                          >
                            <FiEye />
                          </button>
                          <button
                            className="edit-btn"
                            onClick={() => navigate(`/orders/edit/${order._id}`)}
                            title="Edit"
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => handleDeleteOrder(order._id)}
                            title="Delete"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--gray-color)' }}>
              <p>No orders found</p>
              <button
                className="add-btn"
                onClick={() => navigate('/orders/add')}
                style={{ marginTop: '16px' }}
              >
                <FiPlus /> Add Your First Order
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Order;
