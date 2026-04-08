import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from './Sidebar.js';
import '../styles.css';
import { storage } from '../utils/storage';
import { orderAPI } from '../services/api';
import { FiArrowLeft, FiEdit2, FiPackage } from 'react-icons/fi';

const ViewOrder = ({ onLogout }) => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await orderAPI.getOrderById(orderId);
      setOrder(response);
    } catch (err) {
      console.error('Error fetching order:', err);
      setError(err.message || 'Failed to fetch order');
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

  if (loading) {
    return (
      <div className="settings-container">
        <Sidebar onLogout={handleLogout} />
        <div className="main-content">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <div className="loading">Loading order...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="settings-container">
        <Sidebar onLogout={handleLogout} />
        <div className="main-content">
          <div className="content-section">
            <div style={{ color: 'var(--alert-color)', textAlign: 'center', padding: '40px' }}>
              {error}
              <div style={{ marginTop: '16px' }}>
                <button className="btn btn-primary" onClick={() => navigate('/orders')}>
                  Back to Orders
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="settings-container">
        <Sidebar onLogout={handleLogout} />
        <div className="main-content">
          <div className="content-section">
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-color)' }}>
              Order not found
              <div style={{ marginTop: '16px' }}>
                <button className="btn btn-primary" onClick={() => navigate('/orders')}>
                  Back to Orders
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-container">
      <Sidebar onLogout={handleLogout} />

      <div className="main-content">
        <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              className="btn btn-secondary"
              onClick={() => navigate('/orders')}
              style={{ padding: '8px 12px' }}
            >
              <FiArrowLeft />
            </button>
            <h1 className="page-title">Order Details</h1>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => navigate(`/orders/edit/${orderId}`)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <FiEdit2 /> Edit Order
          </button>
        </div>

        <div className="content-section">
          {/* Basic Information */}
          <div className="view-section" style={{ marginBottom: '32px' }}>
            <h3 className="section-title" style={{ marginBottom: '20px', paddingBottom: '10px', borderBottom: '3px solid var(--primary-color)', display: 'inline-block' }}>
              Basic Information
            </h3>
            <div className="view-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
              <div className="view-item">
                <label style={{ fontSize: '12px', color: 'var(--gray-color)', textTransform: 'uppercase' }}>Order ID</label>
                <p style={{ fontWeight: '500', marginTop: '4px' }}>{order._id}</p>
              </div>
              <div className="view-item">
                <label style={{ fontSize: '12px', color: 'var(--gray-color)', textTransform: 'uppercase' }}>Customer</label>
                <p style={{ fontWeight: '500', marginTop: '4px' }}>{order.customerId?.name || order.customerId || '-'}</p>
              </div>
              <div className="view-item">
                <label style={{ fontSize: '12px', color: 'var(--gray-color)', textTransform: 'uppercase' }}>Order Type</label>
                <p style={{ fontWeight: '500', marginTop: '4px', textTransform: 'capitalize' }}>{order.orderType || '-'}</p>
              </div>
              <div className="view-item">
                <label style={{ fontSize: '12px', color: 'var(--gray-color)', textTransform: 'uppercase' }}>Status</label>
                <p style={{ marginTop: '4px' }}>{getStatusBadge(order.status)}</p>
              </div>
              {order.orderType === 'product' && (
                <div className="view-item">
                  <label style={{ fontSize: '12px', color: 'var(--gray-color)', textTransform: 'uppercase' }}>Product</label>
                  <p style={{ fontWeight: '500', marginTop: '4px' }}>{order.productId?.name || order.productId || '-'}</p>
                </div>
              )}
              {order.orderType === 'customized' && (
                <>
                  <div className="view-item">
                    <label style={{ fontSize: '12px', color: 'var(--gray-color)', textTransform: 'uppercase' }}>Outfit Type</label>
                    <p style={{ fontWeight: '500', marginTop: '4px' }}>{order.outfitTypeId?.name || order.outfitTypeId || '-'}</p>
                  </div>
                  <div className="view-item">
                    <label style={{ fontSize: '12px', color: 'var(--gray-color)', textTransform: 'uppercase' }}>Subcategory</label>
                    <p style={{ fontWeight: '500', marginTop: '4px' }}>{order.subCategoryName || '-'}</p>
                  </div>
                </>
              )}
              <div className="view-item">
                <label style={{ fontSize: '12px', color: 'var(--gray-color)', textTransform: 'uppercase' }}>Delivery Date</label>
                <p style={{ fontWeight: '500', marginTop: '4px' }}>{order.deliveryDate || '-'}</p>
              </div>
            </div>
          </div>

          {/* Reference Images */}
          {order.outfitStyleRefImg && order.outfitStyleRefImg.length > 0 && (
            <div className="view-section" style={{ marginBottom: '32px' }}>
              <h3 className="section-title" style={{ marginBottom: '20px', paddingBottom: '10px', borderBottom: '3px solid var(--primary-color)', display: 'inline-block' }}>
                Reference Images
              </h3>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {order.outfitStyleRefImg.map((img, index) => (
                  <div key={index} style={{ width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '2px solid var(--border-color)' }}>
                    <img src={img} alt={`Reference ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Measurements */}
          {order.measurement && order.measurement.length > 0 && (
            <div className="view-section" style={{ marginBottom: '32px' }}>
              <h3 className="section-title" style={{ marginBottom: '20px', paddingBottom: '10px', borderBottom: '3px solid var(--primary-color)', display: 'inline-block' }}>
                Measurements
              </h3>
              <div className="view-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                {order.measurement.map((measure, index) => (
                  <div key={index} className="view-item" style={{ background: 'var(--background-light)', padding: '12px 16px', borderRadius: '8px' }}>
                    <label style={{ fontSize: '12px', color: 'var(--gray-color)' }}>{measure.fieldLable}</label>
                    <p style={{ fontWeight: '500', marginTop: '4px' }}>{measure.fieldValue} {measure.unit}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Addons */}
          {order.addons && order.addons.length > 0 && (
            <div className="view-section" style={{ marginBottom: '32px' }}>
              <h3 className="section-title" style={{ marginBottom: '20px', paddingBottom: '10px', borderBottom: '3px solid var(--primary-color)', display: 'inline-block' }}>
                Addons
              </h3>
              <div className="view-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                {order.addons.filter(a => a.isSelected).map((addon, index) => (
                  <div key={index} className="view-item" style={{ background: 'var(--background-light)', padding: '12px 16px', borderRadius: '8px' }}>
                    <label style={{ fontSize: '12px', color: 'var(--gray-color)' }}>{addon.title}</label>
                    <p style={{ fontWeight: '500', marginTop: '4px' }}>{addon.value || 'Selected'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fabric Details */}
          {(order.fabricType || order.fabricColor) && (
            <div className="view-section" style={{ marginBottom: '32px' }}>
              <h3 className="section-title" style={{ marginBottom: '20px', paddingBottom: '10px', borderBottom: '3px solid var(--primary-color)', display: 'inline-block' }}>
                Fabric Details
              </h3>
              <div className="view-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                <div className="view-item">
                  <label style={{ fontSize: '12px', color: 'var(--gray-color)', textTransform: 'uppercase' }}>Fabric Type</label>
                  <p style={{ fontWeight: '500', marginTop: '4px' }}>{order.fabricType || '-'}</p>
                </div>
                <div className="view-item">
                  <label style={{ fontSize: '12px', color: 'var(--gray-color)', textTransform: 'uppercase' }}>Fabric Color</label>
                  <p style={{ fontWeight: '500', marginTop: '4px' }}>{order.fabricColor || '-'}</p>
                </div>
                <div className="view-item">
                  <label style={{ fontSize: '12px', color: 'var(--gray-color)', textTransform: 'uppercase' }}>Meters Required</label>
                  <p style={{ fontWeight: '500', marginTop: '4px' }}>{order.metersRequired || '-'}</p>
                </div>
                {order.fabricNotes && (
                  <div className="view-item" style={{ gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: '12px', color: 'var(--gray-color)', textTransform: 'uppercase' }}>Fabric Notes</label>
                    <p style={{ fontWeight: '500', marginTop: '4px' }}>{order.fabricNotes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Fusing Details */}
          {order.fusingRequired && (
            <div className="view-section" style={{ marginBottom: '32px' }}>
              <h3 className="section-title" style={{ marginBottom: '20px', paddingBottom: '10px', borderBottom: '3px solid var(--primary-color)', display: 'inline-block' }}>
                Fusing Details
              </h3>
              <div className="view-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                <div className="view-item">
                  <label style={{ fontSize: '12px', color: 'var(--gray-color)', textTransform: 'uppercase' }}>Fusing Color</label>
                  <p style={{ fontWeight: '500', marginTop: '4px' }}>{order.fusingColor || '-'}</p>
                </div>
                <div className="view-item">
                  <label style={{ fontSize: '12px', color: 'var(--gray-color)', textTransform: 'uppercase' }}>Price per Meter</label>
                  <p style={{ fontWeight: '500', marginTop: '4px' }}>₹{order.fusingPricePerMeter || '-'}</p>
                </div>
                <div className="view-item">
                  <label style={{ fontSize: '12px', color: 'var(--gray-color)', textTransform: 'uppercase' }}>Total Meters</label>
                  <p style={{ fontWeight: '500', marginTop: '4px' }}>{order.totalFusingMeters || '-'}</p>
                </div>
                <div className="view-item">
                  <label style={{ fontSize: '12px', color: 'var(--gray-color)', textTransform: 'uppercase' }}>Total Fusing Price</label>
                  <p style={{ fontWeight: '500', marginTop: '4px' }}>₹{order.totalFusingPrice || '-'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Work Types */}
          {order.workTypes && order.workTypes.length > 0 && (
            <div className="view-section" style={{ marginBottom: '32px' }}>
              <h3 className="section-title" style={{ marginBottom: '20px', paddingBottom: '10px', borderBottom: '3px solid var(--primary-color)', display: 'inline-block' }}>
                Work Types
              </h3>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {order.workTypes.map((work, index) => (
                  <span key={index} style={{ background: 'var(--background-light)', padding: '8px 16px', borderRadius: '16px', fontSize: '14px' }}>
                    {work}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Embroidery & Stitching */}
          {(order.embroideryWorkNotes || order.assignWorker || order.stitichingStyle) && (
            <div className="view-section" style={{ marginBottom: '32px' }}>
              <h3 className="section-title" style={{ marginBottom: '20px', paddingBottom: '10px', borderBottom: '3px solid var(--primary-color)', display: 'inline-block' }}>
                Embroidery & Stitching
              </h3>
              <div className="view-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                {order.embroideryWorkNotes && (
                  <div className="view-item" style={{ gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: '12px', color: 'var(--gray-color)', textTransform: 'uppercase' }}>Embroidery Notes</label>
                    <p style={{ fontWeight: '500', marginTop: '4px' }}>{order.embroideryWorkNotes}</p>
                  </div>
                )}
                <div className="view-item">
                  <label style={{ fontSize: '12px', color: 'var(--gray-color)', textTransform: 'uppercase' }}>Assign Worker</label>
                  <p style={{ fontWeight: '500', marginTop: '4px' }}>{order.assignWorker || '-'}</p>
                </div>
                <div className="view-item">
                  <label style={{ fontSize: '12px', color: 'var(--gray-color)', textTransform: 'uppercase' }}>Stitching Style</label>
                  <p style={{ fontWeight: '500', marginTop: '4px' }}>{order.stitichingStyle || '-'}</p>
                </div>
                {order.stitichingNotes && (
                  <div className="view-item" style={{ gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: '12px', color: 'var(--gray-color)', textTransform: 'uppercase' }}>Stitching Notes</label>
                    <p style={{ fontWeight: '500', marginTop: '4px' }}>{order.stitichingNotes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timeline & Pricing */}
          {(order.totalDays || order.totalPrice) && (
            <div className="view-section" style={{ marginBottom: '32px' }}>
              <h3 className="section-title" style={{ marginBottom: '20px', paddingBottom: '10px', borderBottom: '3px solid var(--primary-color)', display: 'inline-block' }}>
                Timeline & Pricing
              </h3>
              <div className="view-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                <div className="view-item" style={{ background: 'var(--background-light)', padding: '12px', borderRadius: '8px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--gray-color)', textTransform: 'uppercase' }}>Fabric Purchase</label>
                  <p style={{ fontWeight: '500', marginTop: '4px', fontSize: '14px' }}>{order.fabricPurchaseDays || 0} days - ₹{order.fabricPurchasePrice || 0}</p>
                </div>
                <div className="view-item" style={{ background: 'var(--background-light)', padding: '12px', borderRadius: '8px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--gray-color)', textTransform: 'uppercase' }}>Dyeing</label>
                  <p style={{ fontWeight: '500', marginTop: '4px', fontSize: '14px' }}>{order.dyeingDays || 0} days - ₹{order.dyeingPrice || 0}</p>
                </div>
                <div className="view-item" style={{ background: 'var(--background-light)', padding: '12px', borderRadius: '8px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--gray-color)', textTransform: 'uppercase' }}>Embroidery</label>
                  <p style={{ fontWeight: '500', marginTop: '4px', fontSize: '14px' }}>{order.embroideryDays || 0} days - ₹{order.embroideryPrice || 0}</p>
                </div>
                <div className="view-item" style={{ background: 'var(--background-light)', padding: '12px', borderRadius: '8px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--gray-color)', textTransform: 'uppercase' }}>Stitching</label>
                  <p style={{ fontWeight: '500', marginTop: '4px', fontSize: '14px' }}>{order.stitichingDays || 0} days - ₹{order.stitichingPrice || 0}</p>
                </div>
                <div className="view-item" style={{ background: 'var(--background-light)', padding: '12px', borderRadius: '8px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--gray-color)', textTransform: 'uppercase' }}>Other Work</label>
                  <p style={{ fontWeight: '500', marginTop: '4px', fontSize: '14px' }}>{order.otherWorkDays || 0} days - ₹{order.otherWorkPrice || 0}</p>
                </div>
                <div className="view-item" style={{ background: 'var(--background-light)', padding: '12px', borderRadius: '8px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--gray-color)', textTransform: 'uppercase' }}>Packing</label>
                  <p style={{ fontWeight: '500', marginTop: '4px', fontSize: '14px' }}>{order.packingDays || 0} days - ₹{order.packingPrice || 0}</p>
                </div>
                <div className="view-item" style={{ background: '#dbeafe', padding: '16px', borderRadius: '8px', gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: '#1e40af', textTransform: 'uppercase', fontWeight: '600' }}>Total Timeline & Price</label>
                    <p style={{ fontWeight: '700', marginTop: '4px', fontSize: '18px', color: '#1e40af' }}>{order.totalDays || 0} days - ₹{order.totalPrice || 0}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <label style={{ fontSize: '12px', color: '#065f46', textTransform: 'uppercase', fontWeight: '600' }}>Advance Paid</label>
                    <p style={{ fontWeight: '700', marginTop: '4px', fontSize: '18px', color: '#065f46' }}>₹{order.advanceAmount || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Special Instructions */}
          {order.specialInstructions && (
            <div className="view-section" style={{ marginBottom: '32px' }}>
              <h3 className="section-title" style={{ marginBottom: '20px', paddingBottom: '10px', borderBottom: '3px solid var(--primary-color)', display: 'inline-block' }}>
                Special Instructions
              </h3>
              <p style={{ background: 'var(--background-light)', padding: '16px', borderRadius: '8px', lineHeight: '1.6' }}>
                {order.specialInstructions}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewOrder;
