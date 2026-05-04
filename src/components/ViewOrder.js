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
  const [activeTab, setActiveTab] = useState('basic');

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

  // Tab configuration
  const tabs = [
    { id: 'basic', label: 'Basic' },
    { id: 'measurements', label: 'Measurements' },
    { id: 'addons', label: 'Add Ons' },
    { id: 'fabric', label: 'Fabric' },
    // { id: 'fusing', label: 'Fusing' },
    { id: 'worktype', label: 'Art Work' },
    { id: 'embroidery', label: 'Stitching' },
    { id: 'otherwork', label: 'Other Work' },
    { id: 'timeline', label: 'Time & Pricing' }
  ];

  // Tab change handler
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
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

        {/* Tab Navigation */}
        <div className="tabs">
          <div className="order-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`tab tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => handleTabChange(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="content-section">
          {/* Basic Information Tab */}
          {activeTab === 'basic' && (
            <div className="tab-content">
              <div className="form-section">
                <h3 className="section-title form-section-title">Basic Information</h3>
                <div className="view-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                  <div className="view-item">
                    <label style={{ fontSize: '12px', color: 'var(--gray-color)', textTransform: 'uppercase' }}>Order ID</label>
                    <p style={{ fontWeight: '500', marginTop: '4px' }}>{order._id}</p>
                  </div>
                  <div className="view-item">
                    <label style={{ fontSize: '12px', color: 'var(--gray-color)', textTransform: 'uppercase' }}>Customer</label>
                    <p style={{ fontWeight: '500', marginTop: '4px' }}>
                      {typeof order.customerId === 'object' && order.customerId !== null
                        ? (order.customerId.fullName || '-')
                        : (order.customerId || '-')}
                    </p>
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
                      <p style={{ fontWeight: '500', marginTop: '4px' }}>{order.productName || '-'}</p>
                    </div>
                  )}
                  {order.orderType === 'customized' && (
                    <>
                      <div className="view-item">
                        <label style={{ fontSize: '12px', color: 'var(--gray-color)', textTransform: 'uppercase' }}>Outfit Type</label>
                        <p style={{ fontWeight: '500', marginTop: '4px' }}>{order.outfitTypeName || '-'}</p>
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
                
                {/* Reference Images */}
                {order.outfitStyleRefImg && order.outfitStyleRefImg.length > 0 && (
                  <div style={{ marginTop: '24px' }}>
                    <h4 style={{ fontSize: '14px', color: 'var(--gray-color)', textTransform: 'uppercase', marginBottom: '12px' }}>Reference Images</h4>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      {order.outfitStyleRefImg.map((img, index) => (
                        <div key={index} style={{ width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '2px solid var(--border-color)' }}>
                          <img src={img} alt={`Reference ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Measurements Tab */}
          {activeTab === 'measurements' && order.measurement && order.measurement.length > 0 && (
            <div className="tab-content">
              <div className="form-section">
                <h3 className="section-title form-section-title">Measurements</h3>
                <div className="view-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  {order.measurement.map((measure, index) => (
                    <div key={index} className="view-item" style={{ background: 'var(--background-light)', padding: '12px 16px', borderRadius: '8px' }}>
                      <label style={{ fontSize: '12px', color: 'var(--gray-color)' }}>{measure.fieldLable}</label>
                      <p style={{ fontWeight: '500', marginTop: '4px' }}>{measure.fieldValue} {measure.unit}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Addons Tab */}
          {activeTab === 'addons' && order.addons && order.addons.length > 0 && (
            <div className="tab-content">
              <div className="form-section">
                <h3 className="section-title form-section-title">Addons</h3>
                <div className="view-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                  {order.addons.filter(a => a.isSelected).map((addon, index) => (
                    <div key={index} className="view-item" style={{ background: 'var(--background-light)', padding: '12px 16px', borderRadius: '8px' }}>
                      <label style={{ fontSize: '12px', color: 'var(--gray-color)' }}>{addon.title}</label>
                      <p style={{ fontWeight: '500', marginTop: '4px' }}>{addon.value || 'Selected'}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Fabric Tab */}
          {activeTab === 'fabric' && (
            <div className="tab-content">
              <div className="form-section">
                <h3 className="section-title form-section-title">Fabric Details</h3>
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
                
                {/* Fabric Reference Images */}
                {order.fabricRefImg && order.fabricRefImg.length > 0 && (
                  <div style={{ marginTop: '24px' }}>
                    <h4 style={{ fontSize: '14px', color: 'var(--gray-color)', textTransform: 'uppercase', marginBottom: '12px' }}>Fabric Reference Images</h4>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      {order.fabricRefImg.map((img, index) => (
                        <div key={index} style={{ width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '2px solid var(--border-color)' }}>
                          <img src={img} alt={`Fabric ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="form-section">
                <h3 className="section-title form-section-title">Fusing Details</h3>
                <div className="view-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                  <div className="view-item">
                    <label style={{ fontSize: '12px', color: 'var(--gray-color)', textTransform: 'uppercase' }}>Fusing Color</label>
                    <p style={{ fontWeight: '500', marginTop: '4px' }}>{order.fusingColor || '-'}</p>
                  </div>
                  <div className="view-item">
                    <label style={{ fontSize: '12px', color: 'var(--gray-color)', textTransform: 'uppercase' }}>Fusing Days</label>
                    <p style={{ fontWeight: '500', marginTop: '4px' }}>{order.fusingDays || 0} days</p>
                  </div>
                  <div className="view-item">
                    <label style={{ fontSize: '12px', color: 'var(--gray-color)', textTransform: 'uppercase' }}>Fusing Price</label>
                    <p style={{ fontWeight: '500', marginTop: '4px' }}>₹{order.fusingPrice || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Fusing Tab */}
          {/* {activeTab === 'fusing' && order.fusingRequired && (
            <div className="tab-content">
              <div className="form-section">
                <h3 className="section-title form-section-title">Fusing Details</h3>
                <div className="view-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                  <div className="view-item">
                    <label style={{ fontSize: '12px', color: 'var(--gray-color)', textTransform: 'uppercase' }}>Fusing Color</label>
                    <p style={{ fontWeight: '500', marginTop: '4px' }}>{order.fusingColor || '-'}</p>
                  </div>
                  <div className="view-item">
                    <label style={{ fontSize: '12px', color: 'var(--gray-color)', textTransform: 'uppercase' }}>Fusing Days</label>
                    <p style={{ fontWeight: '500', marginTop: '4px' }}>{order.fusingDays || 0} days</p>
                  </div>
                  <div className="view-item">
                    <label style={{ fontSize: '12px', color: 'var(--gray-color)', textTransform: 'uppercase' }}>Fusing Price</label>
                    <p style={{ fontWeight: '500', marginTop: '4px' }}>₹{order.fusingPrice || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          )} */}

          {/* Work Type Tab */}
          {activeTab === 'worktype' && (
            <div className="tab-content">
              <div className="form-section">
                <h3 className="section-title form-section-title">Work Types</h3>
                {order.workTypes && order.workTypes.length > 0 ? (
                  <>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
                      {order.workTypes.map((work, index) => (
                        <span key={index} style={{ background: 'var(--background-light)', padding: '8px 16px', borderRadius: '16px', fontSize: '14px' }}>
                          {work}
                        </span>
                      ))}
                    </div>
                    
                    {/* Work Type Reference Images */}
                    {order.workTypeRefImg && order.workTypeRefImg.length > 0 && (
                      <div>
                        <h4 style={{ fontSize: '14px', color: 'var(--gray-color)', textTransform: 'uppercase', marginBottom: '12px' }}>Work Type Reference Images</h4>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                          {order.workTypeRefImg.map((img, index) => (
                            <div key={index} style={{ width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '2px solid var(--border-color)' }}>
                              <img src={img} alt={`Work Type ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p style={{ color: 'var(--gray-color)', fontStyle: 'italic' }}>No work types specified.</p>
                )}
              </div>
            </div>
          )}

          {/* Embroidery & Stitching Tab */}
          {activeTab === 'embroidery' && (
            <div className="tab-content">
              <div className="form-section">
                <h3 className="section-title form-section-title">Embroidery & Stitching</h3>
                <div className="view-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                  {order.embroideryWorkNotes && (
                    <div className="view-item" style={{ gridColumn: '1 / -1' }}>
                      <label style={{ fontSize: '12px', color: 'var(--gray-color)', textTransform: 'uppercase' }}>Embroidery Notes</label>
                      <p style={{ fontWeight: '500', marginTop: '4px' }}>{order.embroideryWorkNotes}</p>
                    </div>
                  )}
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
                
                {/* Worker Assignments */}
                {order.assignWorker && Array.isArray(order.assignWorker) && order.assignWorker.length > 0 && (
                  <div style={{ marginTop: '24px' }}>
                    <h4 style={{ fontSize: '14px', color: 'var(--gray-color)', textTransform: 'uppercase', marginBottom: '12px' }}>Worker Assignments</h4>
                    <div className="view-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                      {order.assignWorker.map((assignment, index) => (
                        <div key={index} className="view-item" style={{ background: 'var(--background-light)', padding: '12px 16px', borderRadius: '8px' }}>
                          <label style={{ fontSize: '12px', color: 'var(--gray-color)' }}>Worker</label>
                          <p style={{ fontWeight: '500', marginTop: '4px' }}>
                            {typeof assignment.workerId === 'object' && assignment.workerId !== null
                              ? (assignment.workerId.fullName || '-')
                              : (assignment.workerId || '-')}
                          </p>
                          <label style={{ fontSize: '12px', color: 'var(--gray-color)', marginTop: '8px' }}>Status</label>
                          <p style={{ fontWeight: '500', marginTop: '4px', textTransform: 'capitalize' }}>{assignment.status || '-'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Embroidery Reference Images */}
                {order.embroideryRefImg && order.embroideryRefImg.length > 0 && (
                  <div style={{ marginTop: '24px' }}>
                    <h4 style={{ fontSize: '14px', color: 'var(--gray-color)', textTransform: 'uppercase', marginBottom: '12px' }}>Embroidery Reference Images</h4>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      {order.embroideryRefImg.map((img, index) => (
                        <div key={index} style={{ width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '2px solid var(--border-color)' }}>
                          <img src={img} alt={`Embroidery ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Stitching Reference Images */}
                {order.stitichingRefImg && order.stitichingRefImg.length > 0 && (
                  <div style={{ marginTop: '24px' }}>
                    <h4 style={{ fontSize: '14px', color: 'var(--gray-color)', textTransform: 'uppercase', marginBottom: '12px' }}>Stitching Reference Images</h4>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      {order.stitichingRefImg.map((img, index) => (
                        <div key={index} style={{ width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '2px solid var(--border-color)' }}>
                          <img src={img} alt={`Stitching ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Other Work Tab */}
          {activeTab === 'otherwork' && (
            <div className="tab-content">
              <div className="form-section">
                <h3 className="section-title form-section-title">Other Work</h3>
                {order.otherWork ? (
                  <>
                    <div className="view-item">
                      <label style={{ fontSize: '12px', color: 'var(--gray-color)', textTransform: 'uppercase' }}>Other Work Details</label>
                      <p style={{ fontWeight: '500', marginTop: '4px' }}>{order.otherWork}</p>
                    </div>
                    
                    {/* Other Work Reference Images */}
                    {order.otherWorkRefImg && order.otherWorkRefImg.length > 0 && (
                      <div style={{ marginTop: '24px' }}>
                        <h4 style={{ fontSize: '14px', color: 'var(--gray-color)', textTransform: 'uppercase', marginBottom: '12px' }}>Other Work Reference Images</h4>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                          {order.otherWorkRefImg.map((img, index) => (
                            <div key={index} style={{ width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '2px solid var(--border-color)' }}>
                              <img src={img} alt={`Other Work ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p style={{ color: 'var(--gray-color)', fontStyle: 'italic' }}>No other work details specified.</p>
                )}
              </div>
            </div>
          )}

          {/* Timeline & Pricing Tab */}
          {activeTab === 'timeline' && (
            <div className="tab-content">
              <div className="form-section">
                <h3 className="section-title form-section-title">Timeline & Pricing</h3>
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
                
                {/* Special Instructions */}
                {order.specialInstructions && (
                  <div style={{ marginTop: '24px' }}>
                    <h4 style={{ fontSize: '14px', color: 'var(--gray-color)', textTransform: 'uppercase', marginBottom: '12px' }}>Special Instructions</h4>
                    <p style={{ background: 'var(--background-light)', padding: '16px', borderRadius: '8px', lineHeight: '1.6' }}>
                      {order.specialInstructions}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewOrder;
