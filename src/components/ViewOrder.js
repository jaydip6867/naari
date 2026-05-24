import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from './Sidebar.js';
import ImagePreview from './ImagePreview.js';
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
  
  // Helper functions
  const formatValue = (value) => {
    if (value === null || value === undefined || value === '') {
      return '-';
    }
    return value;
  };

  // Image preview state
  const [imagePreview, setImagePreview] = useState({
    isOpen: false,
    images: [],
    currentIndex: 0
  });

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
    { id: 'assignworker', label: 'Assign Worker' },
    { id: 'otherwork', label: 'Other Work' },
    { id: 'timeline', label: 'Time & Pricing' }
  ];

  // Tab change handler
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  // Image preview handlers
  const openImagePreview = (images, startIndex = 0) => {
    setImagePreview({
      isOpen: true,
      images: images,
      currentIndex: startIndex
    });
  };

  const closeImagePreview = () => {
    setImagePreview({
      isOpen: false,
      images: [],
      currentIndex: 0
    });
  };

  const handlePreviousImage = () => {
    setImagePreview(prev => ({
      ...prev,
      currentIndex: prev.currentIndex > 0 ? prev.currentIndex - 1 : prev.images.length - 1
    }));
  };

  const handleNextImage = () => {
    setImagePreview(prev => ({
      ...prev,
      currentIndex: prev.currentIndex < prev.images.length - 1 ? prev.currentIndex + 1 : 0
    }));
  };

  const handleThumbnailClick = (index) => {
    setImagePreview(prev => ({
      ...prev,
      currentIndex: index
    }));
  };

  // Keyboard navigation for image preview
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!imagePreview.isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          closeImagePreview();
          break;
        case 'ArrowLeft':
          handlePreviousImage();
          break;
        case 'ArrowRight':
          handleNextImage();
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [imagePreview.isOpen]);

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
                    <label style={{ fontSize: '12px', color: 'var(--gray-color)', textTransform: 'uppercase' }}>Invoice Number</label>
                    <p style={{ fontWeight: '500', marginTop: '4px' }}>{order.orderId}</p>
                  </div>
                  <div className="view-item">
                    <label style={{ fontSize: '12px', color: 'var(--gray-color)', textTransform: 'uppercase' }}>Order Date</label>
                    <p style={{ fontWeight: '500', marginTop: '4px' }}>
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : '-'}
                    </p>
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
                  {/* <div className="view-item">
                    <label style={{ fontSize: '12px', color: 'var(--gray-color)', textTransform: 'uppercase' }}>Total Price</label>
                    <p style={{ fontWeight: '600', fontSize: '18px', color: '#1e40af', marginTop: '4px' }}>₹{order.totalPrice || 0}</p>
                  </div> */}
                  <div className="view-item">
                    <label style={{ fontSize: '12px', color: 'var(--gray-color)', textTransform: 'uppercase' }}>Selling Price</label>
                    <p style={{ fontWeight: '600', fontSize: '18px', color: '#1e40af', marginTop: '4px' }}>₹{order.sellingPrice || 0}</p>
                  </div>
                  <div className="view-item">
                    <label style={{ fontSize: '12px', color: 'var(--gray-color)', textTransform: 'uppercase' }}>Paid Amount</label>
                    <p style={{ fontWeight: '600', fontSize: '18px', color: '#065f46', marginTop: '4px' }}>₹{order.advanceAmount || 0}</p>
                  </div>
                  <div className="view-item">
                    <label style={{ fontSize: '12px', color: 'var(--gray-color)', textTransform: 'uppercase' }}>Pending Amount</label>
                    <p style={{ fontWeight: '600', fontSize: '18px', color: 'var(--alert-color)', marginTop: '4px' }}>₹{order.sellingPrice - order.advanceAmount || 0}</p>
                  </div>
                  <div className="view-item">
                    <label style={{ fontSize: '12px', color: 'var(--gray-color)', textTransform: 'uppercase' }}>Diff Percentage (%)</label>
                    <p style={{ fontWeight: '600', fontSize: '18px', color: '#065f46', marginTop: '4px' }}>₹{order.diffPercentage || 0} %</p>
                  </div>
                </div>
                
                {/* Reference Images */}
                {order.outfitStyleRefImg && order.outfitStyleRefImg.length > 0 && (
                  <div style={{ marginTop: '24px' }}>
                    <h4 style={{ fontSize: '14px', color: 'var(--gray-color)', textTransform: 'uppercase', marginBottom: '12px' }}>Reference Images</h4>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      {order.outfitStyleRefImg.map((img, index) => (
                        <div 
                          key={index} 
                          style={{ 
                            width: '100px', 
                            height: '100px', 
                            borderRadius: '8px', 
                            overflow: 'hidden', 
                            border: '2px solid var(--border-color)',
                            cursor: 'pointer',
                            transition: 'transform 0.2s ease, border-color 0.2s ease'
                          }}
                          onClick={() => openImagePreview(order.outfitStyleRefImg, index)}
                          title={`Click to view image ${index + 1}`}
                        >
                          <img 
                            src={img} 
                            alt={`Reference ${index + 1}`} 
                            style={{ 
                              width: '100%', 
                              height: '100%', 
                              objectFit: 'cover',
                              transition: 'transform 0.2s ease'
                            }} 
                          />
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
                        <div 
                          key={index} 
                          style={{ 
                            width: '100px', 
                            height: '100px', 
                            borderRadius: '8px', 
                            overflow: 'hidden', 
                            border: '2px solid var(--border-color)',
                            cursor: 'pointer',
                            transition: 'transform 0.2s ease, border-color 0.2s ease'
                          }}
                          onClick={() => openImagePreview(order.fabricRefImg, index)}
                          title={`Click to view fabric image ${index + 1}`}
                        >
                          <img 
                            src={img} 
                            alt={`Fabric ${index + 1}`} 
                            style={{ 
                              width: '100%', 
                              height: '100%', 
                              objectFit: 'cover',
                              transition: 'transform 0.2s ease'
                            }} 
                          />
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
                </div>
              </div>
            </div>
          )}

          {/* Work Type Tab */}
          {activeTab === 'worktype' && (
            <div className="tab-content">
              <div className="form-section">
                <h3 className="section-title form-section-title">Art Work</h3>
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
                            <div 
                              key={index} 
                              style={{ 
                                width: '100px', 
                                height: '100px', 
                                borderRadius: '8px', 
                                overflow: 'hidden', 
                                border: '2px solid var(--border-color)',
                                cursor: 'pointer',
                                transition: 'transform 0.2s ease, border-color 0.2s ease'
                              }}
                              onClick={() => openImagePreview(order.workTypeRefImg, index)}
                              title={`Click to view work type image ${index + 1}`}
                            >
                              <img 
                                src={img} 
                                alt={`Work Type ${index + 1}`} 
                                style={{ 
                                  width: '100%', 
                                  height: '100%', 
                                  objectFit: 'cover',
                                  transition: 'transform 0.2s ease'
                                }} 
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {order.embroideryWorkNotes && (
                    <div className="view-item" style={{ gridColumn: '1 / -1' }}>
                      <label style={{ fontSize: '12px', color: 'var(--gray-color)', textTransform: 'uppercase' }}>Art Work Notes</label>
                      <p style={{ fontWeight: '500', marginTop: '4px' }}>{order.embroideryWorkNotes}</p>
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
                <h3 className="section-title form-section-title">Stitching</h3>
                <div className="view-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                  
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
                
                
                {/* Embroidery Reference Images */}
                {order.embroideryRefImg && order.embroideryRefImg.length > 0 && (
                  <div style={{ marginTop: '24px' }}>
                    <h4 style={{ fontSize: '14px', color: 'var(--gray-color)', textTransform: 'uppercase', marginBottom: '12px' }}>Embroidery Reference Images</h4>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      {order.embroideryRefImg.map((img, index) => (
                        <div 
                          key={index} 
                          style={{ 
                            width: '100px', 
                            height: '100px', 
                            borderRadius: '8px', 
                            overflow: 'hidden', 
                            border: '2px solid var(--border-color)',
                            cursor: 'pointer',
                            transition: 'transform 0.2s ease, border-color 0.2s ease'
                          }}
                          onClick={() => openImagePreview(order.embroideryRefImg, index)}
                          title={`Click to view embroidery image ${index + 1}`}
                        >
                          <img 
                            src={img} 
                            alt={`Embroidery ${index + 1}`} 
                            style={{ 
                              width: '100%', 
                              height: '100%', 
                              objectFit: 'cover',
                              transition: 'transform 0.2s ease'
                            }} 
                          />
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
                        <div 
                          key={index} 
                          style={{ 
                            width: '100px', 
                            height: '100px', 
                            borderRadius: '8px', 
                            overflow: 'hidden', 
                            border: '2px solid var(--border-color)',
                            cursor: 'pointer',
                            transition: 'transform 0.2s ease, border-color 0.2s ease'
                          }}
                          onClick={() => openImagePreview(order.stitichingRefImg, index)}
                          title={`Click to view stitching image ${index + 1}`}
                        >
                          <img 
                            src={img} 
                            alt={`Stitching ${index + 1}`} 
                            style={{ 
                              width: '100%', 
                              height: '100%', 
                              objectFit: 'cover',
                              transition: 'transform 0.2s ease'
                            }} 
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Assign Worker Tab */}
          {activeTab === 'assignworker' && (
            <div className="tab-content">
              <div className="form-section">
                <h3 className="section-title form-section-title">Assign Worker</h3>
                {order.assignWorker && Array.isArray(order.assignWorker) && order.assignWorker.length > 0 ? (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ backgroundColor: 'var(--background-light)' }}>
                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>Worker Name</th>
                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>Status</th>
                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.assignWorker.map((assignment, index) => (
                          <tr key={index}>
                            <td style={{ padding: '12px', borderBottom: '1px solid var(--border-color)' }}>
                              {typeof assignment.workerId === 'object' && assignment.workerId !== null
                                ? (assignment.workerId.fullName || '-')
                                : (assignment.workerId || '-')}
                            </td>
                            <td style={{ padding: '12px', borderBottom: '1px solid var(--border-color)' }}>
                              <span style={{ 
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '12px',
                                backgroundColor: assignment.status === 'completed' ? 'var(--success-color)' : 
                                                assignment.status === 'in-progress' ? 'var(--warning-color)' : 
                                                assignment.status === 'dying' ? '#ff9800' :
                                                assignment.status === 'packing' ? '#2196f3' : 'var(--gray-color)',
                                color: 'white',
                                textTransform: 'capitalize'
                              }}>
                                {formatValue(assignment.status)}
                              </span>
                            </td>
                            <td style={{ padding: '12px', borderBottom: '1px solid var(--border-color)' }}>
                              {assignment.description || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-color)', backgroundColor: 'var(--background-light)', borderRadius: 'var(--radius-md)' }}>
                    No workers assigned
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
                            <div 
                              key={index} 
                              style={{ 
                                width: '100px', 
                                height: '100px', 
                                borderRadius: '8px', 
                                overflow: 'hidden', 
                                border: '2px solid var(--border-color)',
                                cursor: 'pointer',
                                transition: 'transform 0.2s ease, border-color 0.2s ease'
                              }}
                              onClick={() => openImagePreview(order.otherWorkRefImg, index)}
                              title={`Click to view other work image ${index + 1}`}
                            >
                              <img 
                                src={img} 
                                alt={`Other Work ${index + 1}`} 
                                style={{ 
                                  width: '100%', 
                                  height: '100%', 
                                  objectFit: 'cover',
                                  transition: 'transform 0.2s ease'
                                }} 
                              />
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
                
                <div className="card">

                  <div className="table">
                    <div className="table-head">
                      <span>Work Stage</span>
                      <span>Days</span>
                      <span>Cost (₹)</span>
                    </div>

                    <div className="row">
                      <span>Fabric Purchase</span>
                      <span>{order.fabricPurchaseDays || 0}</span>
                      <span>{order.fabricPurchasePrice || 0}</span>
                    </div>

                    <div className="row">
                      <span>Dyeing / Color Work</span>
                      <span>{order.dyeingDays || 0}</span>
                      <span>{order.dyeingPrice || 0}</span>
                    </div>

                    <div className="row">
                      <span>Embroidery / Art Work</span>
                      <span>{order.embroideryDays || 0}</span>
                      <span>{order.embroideryPrice || 0}</span>
                    </div>

                    <div className="row">
                      <span>Stitching</span>
                      <span>{order.stitichingDays || 0}</span>
                      <span>{order.stitichingPrice || 0}</span>
                    </div>

                    <div className="row">
                      <span>Other / Finishing Work</span>
                      <span>{order.otherWorkDays || 0}</span>
                      <span>{order.otherWorkPrice || 0}</span>
                    </div>

                    <div className="row">
                      <span>QC + Packing</span>
                      <span>{order.packingDays || 0}</span>
                      <span>{order.packingPrice || 0}</span>
                    </div>

                    <div className="row">
                      <span>Khakha Work</span>
                      <span>{order.khakhaDays || 0}</span>
                      <span>{order.khakhaPrice || 0}</span>
                    </div>

                    <div className="row">
                      <span>Art Work</span>
                      <span>{order.artWorkDays || 0}</span>
                      <span>{order.artWorkPrice || 0}</span>
                    </div>
                  </div>

                  <div className="total">
                    <span>TOTAL</span>
                    <div>
                      <span>{order.totalDays || 0} days</span>
                      <span>₹{order.totalPrice || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="pricing">
                  <h3>💰 Pricing & Delivery</h3>

                  <div className="form-row">
                    <div>
                      <label>Total Cost (₹)</label>
                      <div className="value-box">{order.totalPrice || 0}</div>
                    </div>
                    <div>
                      <label>Selling Price (₹)</label>
                      <div className="value-box">{order.sellingPrice || 0}</div>
                    </div>
                    <div>
                      <label>Diff Percentage (%)</label>
                      <div className="value-box">{order.diffPercentage || 0}</div>
                    </div>
                    
                  </div>

                  <div className="form-row">
                    <div>
                      <label>Advance (₹)</label>
                      <div className="value-box">{order.advanceAmount || 0}</div>
                    </div>
                    <div>
                      <label>Pending (₹)</label>
                      <div className="value-box">{order.sellingPrice - order.advanceAmount || 0}</div>
                    </div>
                    <div>
                      <label>Delivery Date</label>
                      <div className="value-box">{order.deliveryDate || 'mm/dd/yyyy'}</div>
                    </div>
                    
                    
                  </div>
                </div>

                {/* Special Instructions */}
                {order.specialInstructions && (
                  <div style={{ marginTop: '20px' }}>
                    <h4 style={{ fontSize: '14px', color: 'var(--gray-color)', textTransform: 'uppercase', marginBottom: '12px' }}>📝 Special Instructions</h4>
                    <div className="value-box" style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', lineHeight: '1.6' }}>
                      {order.specialInstructions}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Image Preview Modal */}
      <ImagePreview
        isOpen={imagePreview.isOpen}
        images={imagePreview.images}
        currentIndex={imagePreview.currentIndex}
        onClose={closeImagePreview}
        onPrevious={handlePreviousImage}
        onNext={handleNextImage}
        onThumbnailClick={handleThumbnailClick}
      />
    </div>
  );
};

export default ViewOrder;
