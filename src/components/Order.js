import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar.js';
import '../styles.css';
import { storage } from '../utils/storage';
import { orderAPI } from '../services/api';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiEye, FiPackage } from 'react-icons/fi';
import Pagination from './Pagination.js';

const Order = ({ onLogout }) => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]); // Store all orders for filtering
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await orderAPI.getOrders(); // Fetch all orders without search
      const ordersData = Array.isArray(response) ? response : (response || []);
      setAllOrders(ordersData); // Store all orders
      setOrders(ordersData); // Initially display all orders
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.response.data.Message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = e.target.value;
    setSearchQuery(query);
    setCurrentPage(1);
    // Filter orders locally
    if (!query.trim()) {
      setOrders(allOrders); // Show all orders if search is empty
    } else {
      const filteredOrders = allOrders.filter(order => {
        const searchLower = query.toLowerCase();
        return (
          (order.orderId && order.orderId.toLowerCase().includes(searchLower)) ||
          (order.customerId && order.customerId.fullName && order.customerId.fullName.toLowerCase().includes(searchLower)) ||
          (order.orderType && order.orderType.toLowerCase().includes(searchLower)) ||
          (order.status && order.status.toLowerCase().includes(searchLower))
        );
      });
      setOrders(filteredOrders);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) {
      return;
    }

    try {
      setLoading(true);
      await orderAPI.cancelOrder(orderId);
      fetchOrders(); // Refresh orders after deletion
    } catch (err) {
      console.error('Error deleting order:', err);
      alert(err.response.data.Message || 'Failed to delete order');
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

  // pagination logic
  const indexOfLastOrder = currentPage * itemsPerPage;
  const indexOfFirstOrder = indexOfLastOrder - itemsPerPage;

  const currentOrders = orders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );

  const totalPages = Math.ceil(
    orders.length / itemsPerPage
  );

  return (
    <div className="settings-container">
      <Sidebar onLogout={handleLogout} />

      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">Order Management</h1>
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


        <div className="content-section">
          <div className="section-header" style={{ flexWrap: 'wrap', gap: '16px' }}>
            <h2 className="section-title">Orders</h2>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', flex: 1, justifyContent: 'flex-end' }}>
              <div className="search-container" style={{ position: 'relative' }}>
                <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-color)' }} />
                <input
                  type="text"
                  placeholder="Search orders..."
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


          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--primary-color)' }}>
              Loading orders...
            </div>
          ) : orders.length > 0 ? (
            <div className="table-container">
              <div className="table-scroll-wrapper">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Order ID</th>
                      <th>Order Date</th>
                      <th>Customer</th>
                      <th>Order Type</th>
                      <th>Status</th>
                      <th>Delivery Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentOrders.map((order, index) => (
                      <tr key={order._id || index} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td >
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
                        <td >{order.orderId || '-'}</td>
                        <td >
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          }) : '-'}
                        </td>
                        <td >
                          {typeof order.customerId === 'object' && order.customerId !== null
                            ? (order.customerId.fullName || order.customerId.name || '-')
                            : (order.customerId || '-')}
                        </td>
                        <td style={{ padding: '12px', textTransform: 'capitalize' }}>{order.orderType || '-'}</td>
                        <td >{getStatusBadge(order.status)}</td>
                        <td >{order.deliveryDate || '-'}</td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
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
                            {order.status !== 'cancelled' && (
                              <button
                                className="delete-btn"
                                onClick={() => handleCancelOrder(order._id)}
                                title="Delete"
                              >
                                <FiTrash2 />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
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
