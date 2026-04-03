import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaPlus, FaSearch, FaSpinner, FaEdit, FaEye,
  FaUser, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaUserTag
} from 'react-icons/fa';
import Sidebar from './Sidebar.js';
import { customerAPI } from '../services/api.js';
import { storage } from '../utils/storage';
import '../styles.css';

const Customer = ({ onLogout }) => {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await customerAPI.getCustomers(
        searchQuery
      );
      if (data) {
        setCustomers(data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch customers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleLogout = () => {
    storage.clearAuthData();
    onLogout();
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCustomers();
  };


  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[0]}-${parts[1]}-${parts[2]}`;
    }
    return dateStr;
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="settings-container">
      <Sidebar onLogout={handleLogout} />

      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">Customer Management</h1>
        </div>

        {error && (
          <div className="error-banner">
            {error}
            <button onClick={() => setError('')} className="close-error">×</button>
          </div>
        )}

        <div className="content-section">
          <div className="section-header">
            <h2 className="section-title">Customers ({customers.length})</h2>
            <div className="header-actions">
              <form onSubmit={handleSearch} className="search-form">
                <div className="search-input-wrapper">
                  <FaSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search customers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                  />
                </div>
                <button type="submit" className="search-btn">
                  Search
                </button>
              </form>
              <button
                className="add-btn"
                onClick={() => navigate('/customers/add')}
              >
                <FaPlus /> Add Customer
              </button>
            </div>
          </div>

          {loading ? (
            <div className="loading-state">
              <FaSpinner className="spinner" />
              <p>Loading customers...</p>
            </div>
          ) : customers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <FaUser />
              </div>
              <h3>No customers found</h3>
              <p>
                {searchQuery
                  ? 'Try adjusting your search query'
                  : 'Get started by adding your first customer'}
              </p>
              <button
                className="add-btn"
                onClick={() => navigate('/customers/add')}
              >
                <FaPlus /> Add Your First Customer
              </button>
            </div>
          ) : (
            <>
              <div className="customer-grid">
                {customers.map((customer) => (
                  <div key={customer._id} className="customer-card">
                    <div className="customer-card-header">
                      <div className="customer-avatar">
                        {customer.profile_pic ? (
                          <img
                            src={customer.profile_pic}
                            alt={customer.fullName}
                            className="avatar-image"
                          />
                        ) : (
                          <div className="avatar-placeholder">
                            {getInitials(customer.fullName)}
                          </div>
                        )}
                      </div>
                      <div className="customer-info">
                        <h3 className="customer-name">{customer.fullName}</h3>
                        {customer.reference && (
                          <span className="customer-reference">
                            <FaUserTag className='icon_fix' /> <span>{customer.reference}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="customer-details">
                      <div className="detail-item">
                        <FaPhone className="detail-icon" />
                        <span>{customer.mobile || '-'}</span>
                      </div>
                      {customer.dob && (
                        <div className="detail-item">
                          <FaCalendarAlt className="detail-icon" />
                          <span>{formatDate(customer.dob)}</span>
                        </div>
                      )}
                      {customer.address && (
                        <div className="detail-item address">
                          <FaMapMarkerAlt className="detail-icon" />
                          <span>{customer.address}</span>
                        </div>
                      )}
                    </div>

                    <div className="customer-actions">
                      <button
                        className="action-btn view"
                        onClick={() => navigate(`/customers/view/${customer._id}`)}
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      <button
                        className="action-btn edit"
                        onClick={() => navigate(`/customers/edit/${customer._id}`)}
                        title="Edit Customer"
                      >
                        <FaEdit />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Customer;
