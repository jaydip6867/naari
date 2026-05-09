import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from './Sidebar.js';
import ImagePreview from './ImagePreview.js';
import '../styles.css';
import { storage } from '../utils/storage';
import { productAPI } from '../services/api';
import { FiEdit2, FiArrowLeft, FiCheck, FiX } from 'react-icons/fi';

const ViewProduct = ({ onLogout }) => {
  const navigate = useNavigate();
  const { productId } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('basic');
  
  // Image preview state
  const [imagePreview, setImagePreview] = useState({
    isOpen: false,
    images: [],
    currentIndex: 0
  });

  // Tab configuration matching AddEditProduct
  const tabs = [
    { id: 'basic', label: 'Basic' },
    { id: 'measurements', label: 'Measurements' },
    { id: 'addons', label: 'Addons' },
    { id: 'fabric', label: 'Fabric' },
    // { id: 'fusing', label: 'Fusing' },
    { id: 'worktype', label: 'Art Work' },
    { id: 'embroidery', label: 'Stitching' },
    { id: 'other', label: 'Other Work' },
    { id: 'assignworker', label: 'Assign Worker' },
    { id: 'quantityprice', label: 'Quantity & Price' }
  ];

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await productAPI.getProductById(productId);
      setProduct(data);
    } catch (err) {
      console.error('Error fetching product:', err);
      setError(err.message || 'Failed to fetch product');
    } finally {
      setLoading(false);
    }
  };

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

  const formatValue = (value) => {
    if (value === null || value === undefined || value === '') return '-';
    return value;
  };

  
  if (loading) {
    return (
      <div className="settings-container">
        <Sidebar onLogout={handleLogout} />
        <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div>Loading product details...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="settings-container">
        <Sidebar onLogout={handleLogout} />
        <div className="main-content">
          <div style={{
            color: 'var(--alert-color)',
            background: 'rgba(255, 0, 0, 0.1)',
            padding: '20px',
            borderRadius: 'var(--radius-md)',
            margin: '20px',
            border: '1px solid rgba(255, 0, 0, 0.2)'
          }}>
            {error}
            <button 
              className="add-btn" 
              onClick={() => navigate('/products')}
              style={{ marginLeft: '12px' }}
            >
              Back to Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="settings-container">
        <Sidebar onLogout={handleLogout} />
        <div className="main-content">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>Product not found</p>
            <button className="add-btn" onClick={() => navigate('/products')}>
              Back to Products
            </button>
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
              onClick={() => navigate('/products')}
              style={{ padding: '8px 12px' }}
            >
              <FiArrowLeft />
            </button>
            <h1 className="page-title">Product Details</h1>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => navigate(`/products/edit/${productId}`)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <FiEdit2 /> Edit Product
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
                    <label style={{ fontSize: '12px', color: 'var(--gray-color)', textTransform: 'uppercase' }}>Product Name</label>
                    <p style={{ fontWeight: '500', marginTop: '4px' }}>{formatValue(product.name)}</p>
                  </div>
                  <div className="view-item">
                    <label style={{ fontSize: '12px', color: 'var(--gray-color)', textTransform: 'uppercase' }}>Outfit Type</label>
                    <p style={{ fontWeight: '500', marginTop: '4px' }}>
                      {product.outfitTypeName || formatValue(product.outfitTypeName)}
                    </p>
                  </div>
                  {product.subCategoryName && (
                    <div className="view-item">
                      <label style={{ fontSize: '12px', color: 'var(--gray-color)', textTransform: 'uppercase' }}>Subcategory</label>
                      <p style={{ fontWeight: '500', marginTop: '4px' }}>{formatValue(product.subCategoryName)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Reference Images */}
              {product.outfitStyleRefImg && product.outfitStyleRefImg.length > 0 && (
                <div className="form-section">
                  <h3 className="section-title form-section-title">Reference Images</h3>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {product.outfitStyleRefImg.map((img, index) => (
                      <div 
                        key={index} 
                        style={{ 
                          width: '150px', 
                          height: '150px', 
                          borderRadius: '8px', 
                          overflow: 'hidden', 
                          border: '1px solid var(--border-color)',
                          cursor: 'pointer',
                          transition: 'transform 0.2s ease, border-color 0.2s ease'
                        }}
                        onClick={() => openImagePreview(product.outfitStyleRefImg, index)}
                        title={`Click to view reference image ${index + 1}`}
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
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.style.display = 'flex';
                            e.target.parentElement.style.alignItems = 'center';
                            e.target.parentElement.style.justifyContent = 'center';
                            e.target.parentElement.style.backgroundColor = 'var(--background-light)';
                            e.target.parentElement.innerText = 'Image not available';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Measurements Tab */}
          {activeTab === 'measurements' && (
            <div className="tab-content">
              <div className="form-section">
                <h3 className="section-title form-section-title">Measurements</h3>
                {product.measurement && product.measurement.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  {product.measurement.map((measure, index) => (
                    <div key={index} className="view-item" style={{ background: 'var(--background-light)', padding: '12px 16px', borderRadius: '8px' }}>
                      <label style={{ fontSize: '12px', color: 'var(--gray-color)' }}>{measure.fieldLable}</label>
                      <p style={{ fontWeight: '500', marginTop: '4px' }}>{measure.fieldValue} {measure.unit}</p>
                    </div>
                  ))}</div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-color)', backgroundColor: 'var(--background-light)', borderRadius: 'var(--radius-md)' }}>
                    No measurements available
                  </div>
                )}
              </div>
              {/* <div className="form-section">
                <h3 className="section-title form-section-title">Measurements</h3>
                {product.measurement && product.measurement.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                    {product.measurement.map((measure, index) => (
                      <div key={index} style={{ 
                        padding: '12px', 
                        background: 'var(--background-light)', 
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)'
                      }}>
                        <label style={{ color: 'var(--gray-color)', fontSize: '12px', textTransform: 'uppercase' }}>
                          {measure.fieldLable}
                        </label>
                        <p style={{ fontSize: '14px', marginBottom: '4px' }}>
                          <strong>Value:</strong> {formatValue(measure.fieldValue)}
                        </p>
                        <p style={{ fontSize: '14px' }}>
                          <strong>Unit:</strong> {formatValue(measure.unit)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-color)', backgroundColor: 'var(--background-light)', borderRadius: 'var(--radius-md)' }}>
                    No measurements available
                  </div>
                )}
              </div> */}
            </div>
          )}

          {/* Addons Tab */}
          {activeTab === 'addons' && (
            <div className="tab-content">
              <div className="form-section">
                <h3 className="section-title form-section-title">Addons</h3>
                {product.addons && product.addons.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                    {product.addons.map((addon, index) => (
                      <div key={index} style={{ 
                        padding: '16px', 
                        background: 'var(--background-light)', 
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontWeight: '600' }}>{addon.title}</span>
                          {addon.isSelected ? (
                            <span style={{ color: 'var(--success-color)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <FiCheck size={16} /> Selected
                            </span>
                          ) : (
                            <span style={{ color: 'var(--gray-color)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <FiX size={16} /> Not Selected
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: '12px', color: 'var(--gray-color)', textTransform: 'capitalize', marginBottom: '8px' }}>
                          Type: {addon.fieldType}
                        </p>
                        {addon.options && addon.options.length > 0 && (
                          <p style={{ fontSize: '12px', color: 'var(--gray-color)', marginBottom: '4px' }}>
                            Options: {addon.options.join(', ')}
                          </p>
                        )}
                        {addon.value && (
                          <p style={{ fontSize: '12px', color: 'var(--gray-color)', marginBottom: '4px' }}>
                            Value: {formatValue(addon.value)}
                          </p>
                        )}
                        {addon.isSelected && addon.value && (
                          <div style={{ 
                            padding: '8px 12px', 
                            background: 'white', 
                            borderRadius: '4px',
                            border: '1px solid var(--border-color)'
                          }}>
                            <span style={{ fontSize: '12px', color: 'var(--gray-color)' }}>Value:</span>
                            <p style={{ fontWeight: '600', marginTop: '2px' }}>{addon.value}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-color)', backgroundColor: 'var(--background-light)', borderRadius: 'var(--radius-md)' }}>
                    No addons available
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Fabric Tab */}
          {activeTab === 'fabric' && (
            <div className="tab-content">
              <div className="form-section">
                <h3 className="section-title form-section-title">Fabric Details</h3>
                <div className="view-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                  {product.fabricType && (
                    <div className="view-item">
                      <label style={{ fontSize: '12px', color: 'var(--gray-color)', textTransform: 'uppercase' }}>Fabric Type</label>
                      <p style={{ fontWeight: '500', marginTop: '4px' }}>{formatValue(product.fabricType)}</p>
                    </div>
                  )}
                  {product.fabricColor && (
                    <div className="view-item">
                      <label style={{ fontSize: '12px', color: 'var(--gray-color)', textTransform: 'uppercase' }}>Fabric Color</label>
                      <p style={{ fontWeight: '500', marginTop: '4px' }}>{formatValue(product.fabricColor)}</p>
                    </div>
                  )}
                  {product.metersRequired && (
                    <div className="view-item">
                      <label style={{ fontSize: '12px', color: 'var(--gray-color)', textTransform: 'uppercase' }}>Meters Required</label>
                      <p style={{ fontWeight: '500', marginTop: '4px' }}>{formatValue(product.metersRequired)}</p>
                    </div>
                  )}
                </div>
                {product.fabricNotes && (
                  <div style={{ marginTop: '20px' }}>
                    <label style={{ fontSize: '12px', color: 'var(--gray-color)', textTransform: 'uppercase' }}>Fabric Notes</label>
                    <p style={{ fontSize: '14px', marginTop: '4px' }}>{formatValue(product.fabricNotes)}</p>
                  </div>
                )}
              </div>

              {/* Fabric Images */}
              {product.fabricRefImg && product.fabricRefImg.length > 0 && (
                <div className="form-section">
                  <h3 className="section-title form-section-title">Fabric Images</h3>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {product.fabricRefImg.map((img, index) => (
                      <div 
                        key={index} 
                        style={{ 
                          width: '150px', 
                          height: '150px', 
                          borderRadius: '8px', 
                          overflow: 'hidden', 
                          border: '1px solid var(--border-color)',
                          cursor: 'pointer',
                          transition: 'transform 0.2s ease, border-color 0.2s ease'
                        }}
                        onClick={() => openImagePreview(product.fabricRefImg, index)}
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
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.style.display = 'flex';
                            e.target.parentElement.style.alignItems = 'center';
                            e.target.parentElement.style.justifyContent = 'center';
                            e.target.parentElement.style.backgroundColor = 'var(--background-light)';
                            e.target.parentElement.innerText = 'Image not available';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="form-section">
                <h3 className="section-title form-section-title">Fusing Details</h3>
                <div className="view-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                  <div className="view-item">
                    <label style={{ fontSize: '12px', color: 'var(--gray-color)', textTransform: 'uppercase' }}>Fusing Required</label>
                    <p style={{ fontWeight: '500', marginTop: '4px' }}>
                      {product.fusingRequired ? 'Yes' : 'No'}
                    </p>
                  </div>
                  {product.fusingColor && (
                    <div className="view-item">
                      <label style={{ fontSize: '12px', color: 'var(--gray-color)', textTransform: 'uppercase' }}>Fusing Color</label>
                      <p style={{ fontWeight: '500', marginTop: '4px' }}>{formatValue(product.fusingColor)}</p>
                    </div>
                  )}
                  {product.fusingPricePerMeter !== undefined && (
                    <div className="view-item">
                      <label style={{ fontSize: '12px', color: 'var(--gray-color)', textTransform: 'uppercase' }}>Price Per Meter</label>
                      <p style={{ fontWeight: '500', marginTop: '4px' }}>{formatValue(product.fusingPricePerMeter)}</p>
                    </div>
                  )}
                  {product.totalFusingMeters !== undefined && (
                    <div className="view-item">
                      <label style={{ fontSize: '12px', color: 'var(--gray-color)', textTransform: 'uppercase' }}>Total Meters</label>
                      <p style={{ fontWeight: '500', marginTop: '4px' }}>{formatValue(product.totalFusingMeters)}</p>
                    </div>
                  )}
                  {product.totalFusingPrice !== undefined && (
                    <div className="view-item">
                      <label style={{ fontSize: '12px', color: 'var(--gray-color)', textTransform: 'uppercase' }}>Total Fusing Price</label>
                      <p style={{ fontWeight: '500', marginTop: '4px' }}>{formatValue(product.totalFusingPrice)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Fusing Tab */}
          {/* {activeTab === 'fusing' && (
            <div className="tab-content">
              
            </div>
          )} */}

          {/* Art Work Tab */}
          {activeTab === 'worktype' && (
            <div className="tab-content">
              <div className="form-section">
                <h3 className="section-title form-section-title">Work Types</h3>
                {product.workTypes && product.workTypes.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {product.workTypes.map((workType, index) => (
                      <span key={index} style={{ 
                        padding: '6px 12px', 
                        background: 'var(--primary-color)', 
                        color: 'white',
                        borderRadius: '20px',
                        fontSize: '14px'
                      }}>
                        {workType}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-color)', backgroundColor: 'var(--background-light)', borderRadius: 'var(--radius-md)' }}>
                    No work types available
                  </div>
                )}
              </div>

              {/* Work Type Images */}
              {product.workTypeRefImg && product.workTypeRefImg.length > 0 && (
                <div className="form-section">
                  <h3 className="section-title form-section-title">Work Type Images</h3>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {product.workTypeRefImg.map((img, index) => (
                      <div 
                        key={index} 
                        style={{ 
                          width: '150px', 
                          height: '150px', 
                          borderRadius: '8px', 
                          overflow: 'hidden', 
                          border: '1px solid var(--border-color)',
                          cursor: 'pointer',
                          transition: 'transform 0.2s ease, border-color 0.2s ease'
                        }}
                        onClick={() => openImagePreview(product.workTypeRefImg, index)}
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
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.style.display = 'flex';
                            e.target.parentElement.style.alignItems = 'center';
                            e.target.parentElement.style.justifyContent = 'center';
                            e.target.parentElement.style.backgroundColor = 'var(--background-light)';
                            e.target.parentElement.innerText = 'Image not available';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Stitching Tab */}
          {activeTab === 'embroidery' && (
            <div className="tab-content">
              <div className="form-section">
                <h3 className="section-title form-section-title">Embroidery & Stitching</h3>
                <div className="view-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                  {product.embroideryWorkNotes && (
                    <div className="view-item">
                      <label style={{ fontSize: '12px', color: 'var(--gray-color)', textTransform: 'uppercase' }}>Embroidery Work Notes</label>
                      <p style={{ fontWeight: '500', marginTop: '4px' }}>{formatValue(product.embroideryWorkNotes)}</p>
                    </div>
                  )}
                  {product.stitichingStyle && (
                    <div className="view-item">
                      <label style={{ fontSize: '12px', color: 'var(--gray-color)', textTransform: 'uppercase' }}>Stitching Style</label>
                      <p style={{ fontWeight: '500', marginTop: '4px' }}>{formatValue(product.stitichingStyle)}</p>
                    </div>
                  )}
                  {product.stitichingNotes && (
                    <div className="view-item">
                      <label style={{ fontSize: '12px', color: 'var(--gray-color)', textTransform: 'uppercase' }}>Stitching Notes</label>
                      <p style={{ fontWeight: '500', marginTop: '4px' }}>{formatValue(product.stitichingNotes)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Embroidery Images */}
              {product.embroideryRefImg && product.embroideryRefImg.length > 0 && (
                <div className="form-section">
                  <h3 className="section-title form-section-title">Embroidery Images</h3>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {product.embroideryRefImg.map((img, index) => (
                      <div 
                        key={index} 
                        style={{ 
                          width: '150px', 
                          height: '150px', 
                          borderRadius: '8px', 
                          overflow: 'hidden', 
                          border: '1px solid var(--border-color)',
                          cursor: 'pointer',
                          transition: 'transform 0.2s ease, border-color 0.2s ease'
                        }}
                        onClick={() => openImagePreview(product.embroideryRefImg, index)}
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
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.style.display = 'flex';
                            e.target.parentElement.style.alignItems = 'center';
                            e.target.parentElement.style.justifyContent = 'center';
                            e.target.parentElement.style.backgroundColor = 'var(--background-light)';
                            e.target.parentElement.innerText = 'Image not available';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stitching Images */}
              {product.stitichingRefImg && product.stitichingRefImg.length > 0 && (
                <div className="form-section">
                  <h3 className="section-title form-section-title">Stitching Images</h3>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {product.stitichingRefImg.map((img, index) => (
                      <div 
                        key={index} 
                        style={{ 
                          width: '150px', 
                          height: '150px', 
                          borderRadius: '8px', 
                          overflow: 'hidden', 
                          border: '1px solid var(--border-color)',
                          cursor: 'pointer',
                          transition: 'transform 0.2s ease, border-color 0.2s ease'
                        }}
                        onClick={() => openImagePreview(product.stitichingRefImg, index)}
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
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.style.display = 'flex';
                            e.target.parentElement.style.alignItems = 'center';
                            e.target.parentElement.style.justifyContent = 'center';
                            e.target.parentElement.style.backgroundColor = 'var(--background-light)';
                            e.target.parentElement.innerText = 'Image not available';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Other Work Tab */}
          {activeTab === 'other' && (
            <div className="tab-content">
              <div className="form-section">
                <h3 className="section-title form-section-title">Other Work</h3>
                {product.otherWork ? (
                  <div className="view-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                    <div className="view-item">
                      <label style={{ fontSize: '12px', color: 'var(--gray-color)', textTransform: 'uppercase' }}>Other Work</label>
                      <p style={{ fontWeight: '500', marginTop: '4px' }}>{formatValue(product.otherWork)}</p>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-color)', backgroundColor: 'var(--background-light)', borderRadius: 'var(--radius-md)' }}>
                    No other work details available
                  </div>
                )}
              </div>

              {/* Other Work Images */}
              {product.otherWorkRefImg && product.otherWorkRefImg.length > 0 && (
                <div className="form-section">
                  <h3 className="section-title form-section-title">Other Work Images</h3>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {product.otherWorkRefImg.map((img, index) => (
                      <div 
                        key={index} 
                        style={{ 
                          width: '150px', 
                          height: '150px', 
                          borderRadius: '8px', 
                          overflow: 'hidden', 
                          border: '1px solid var(--border-color)',
                          cursor: 'pointer',
                          transition: 'transform 0.2s ease, border-color 0.2s ease'
                        }}
                        onClick={() => openImagePreview(product.otherWorkRefImg, index)}
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
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.style.display = 'flex';
                            e.target.parentElement.style.alignItems = 'center';
                            e.target.parentElement.style.justifyContent = 'center';
                            e.target.parentElement.style.backgroundColor = 'var(--background-light)';
                            e.target.parentElement.innerText = 'Image not available';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Assign Worker Tab */}
          {activeTab === 'assignworker' && (
            <div className="tab-content">
              <div className="form-section">
                <h3 className="section-title form-section-title">Assign Worker</h3>
                {product.assignWorker && product.assignWorker.length > 0 ? (
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
                        {product.assignWorker.map((assignment, index) => (
                          <tr key={index}>
                            <td style={{ padding: '12px', borderBottom: '1px solid var(--border-color)' }}>
                              {formatValue(assignment.workerId?.fullName || 'Unknown')}
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

          {/* Quantity & Price Tab */}
          {activeTab === 'quantityprice' && (
            <div className="tab-content">
              <div className="form-section">
                <h3 className="section-title form-section-title">Timeline & Pricing</h3>

                {/* Timeline Table */}
                <div className="card">
                  <div className="table">
                    <div className="table-head">
                      <span>Work Stage</span>
                      <span>Days</span>
                      <span>Cost (₹)</span>
                    </div>

                    <div className="row">
                      <span>Fabric Purchase</span>
                      <span>{product.fabricPurchaseDays || 0}</span>
                      <span>{product.fabricPurchasePrice || 0}</span>
                    </div>

                    <div className="row">
                      <span>Dyeing Work</span>
                      <span>{product.dyeingDays || 0}</span>
                      <span>{product.dyeingPrice || 0}</span>
                    </div>

                    <div className="row">
                      <span>Embroidery Work</span>
                      <span>{product.embroideryDays || 0}</span>
                      <span>{product.embroideryPrice || 0}</span>
                    </div>

                    <div className="row">
                      <span>Stitching Work</span>
                      <span>{product.stitichingDays || 0}</span>
                      <span>{product.stitichingPrice || 0}</span>
                    </div>

                    <div className="row">
                      <span>Other Work</span>
                      <span>{product.otherWorkDays || 0}</span>
                      <span>{product.otherWorkPrice || 0}</span>
                    </div>

                    <div className="row">
                      <span>QC + Packing</span>
                      <span>{product.packingDays || 0}</span>
                      <span>{product.packingPrice || 0}</span>
                    </div>

                    <div className="row">
                      <span>Khakha Work</span>
                      <span>{product.khakhaDays || 0}</span>
                      <span>{product.khakhaPrice || 0}</span>
                    </div>

                    <div className="row">
                      <span>Art Work</span>
                      <span>{product.artWorkDays || 0}</span>
                      <span>{product.artWorkPrice || 0}</span>
                    </div>

                    <div className="total">
                      <span>TOTAL</span>
                      <div>
                        <span>{product.totalDays || 0} days</span>
                        <span>₹{product.totalPrice || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pricing Section */}
                <div className="pricing">
                  <h3 className="section-title form-section-title">Pricing</h3>

                  <div className="view-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                    {product.sellingPrice && (
                      <div className="view-item">
                        <label style={{ fontSize: '12px', color: 'var(--gray-color)', textTransform: 'uppercase' }}>Selling Price</label>
                        <p style={{ fontSize: '24px', fontWeight: '600', marginTop: '4px', color: 'var(--primary-color)' }}>
                          ₹{formatValue(product.sellingPrice)}
                        </p>
                      </div>
                    )}
                    {product.diffPercentage && (
                      <div className="view-item">
                        <label style={{ fontSize: '12px', color: 'var(--gray-color)', textTransform: 'uppercase' }}>Diff Percentage</label>
                        <p style={{ fontSize: '24px', fontWeight: '600', marginTop: '4px', color: 'var(--primary-color)' }}>
                          {product.diffPercentage}%
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Original Quantity & Price Section */}
                <div className="form-section">
                  <h3 className="section-title form-section-title">Quantity & Price</h3>
                  <div className="view-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                    {product.quantity && (
                      <div className="view-item">
                        <label style={{ fontSize: '12px', color: 'var(--gray-color)', textTransform: 'uppercase' }}>Quantity</label>
                        <p style={{ fontSize: '24px', fontWeight: '600', marginTop: '4px', color: 'var(--primary-color)' }}>
                          {formatValue(product.quantity)}
                        </p>
                      </div>
                    )}
                    {product.price && (
                      <div className="view-item">
                        <label style={{ fontSize: '12px', color: 'var(--gray-color)', textTransform: 'uppercase' }}>Price</label>
                        <p style={{ fontSize: '24px', fontWeight: '600', marginTop: '4px', color: 'var(--primary-color)' }}>
                          ₹{formatValue(product.price)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
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

export default ViewProduct;
