import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from './Sidebar.js';
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
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              className="btn btn-cancel" 
              onClick={() => navigate('/products')}
              style={{ padding: '8px 12px' }}
            >
              <FiArrowLeft style={{ marginRight: '6px' }} />
              Back
            </button>
            <h1 className="page-title">{product.name}</h1>
          </div>
          <button 
            className="add-btn"
            onClick={() => navigate(`/products/edit/${productId}`)}
          >
            <FiEdit2 style={{ marginRight: '6px' }} />
            Edit Product
          </button>
        </div>

        <div className="content-section">
          {/* Basic Information */}
          <div style={{ marginBottom: '32px' }}>
            <h3 className="section-title" style={{ marginBottom: '16px', borderBottom: '2px solid var(--primary-color)', paddingBottom: '8px' }}>
              Basic Information
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ color: 'var(--gray-color)', fontSize: '14px' }}>Product Name</label>
                <p style={{ fontSize: '16px', fontWeight: '600', marginTop: '4px' }}>{formatValue(product.name)}</p>
              </div>
              <div>
                <label style={{ color: 'var(--gray-color)', fontSize: '14px' }}>Outfit Type</label>
                <p style={{ fontSize: '16px', fontWeight: '600', marginTop: '4px' }}>
                  {product.outfitTypeId?.name || formatValue(product.outfitTypeId)}
                </p>
              </div>
              {product.subCategoryName && (
                <div>
                  <label style={{ color: 'var(--gray-color)', fontSize: '14px' }}>Subcategory</label>
                  <p style={{ fontSize: '16px', fontWeight: '600', marginTop: '4px' }}>{formatValue(product.subCategoryName)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Reference Images */}
          {product.outfitStyleRefImg && product.outfitStyleRefImg.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <h3 className="section-title" style={{ marginBottom: '16px', borderBottom: '2px solid var(--primary-color)', paddingBottom: '8px' }}>
                Reference Images
              </h3>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {product.outfitStyleRefImg.map((img, index) => (
                  <div key={index} style={{ width: '150px', height: '150px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                    <img 
                      src={img} 
                      alt={`Reference ${index + 1}`} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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

          {/* Measurements */}
          {product.measurement && product.measurement.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <h3 className="section-title" style={{ marginBottom: '16px', borderBottom: '2px solid var(--primary-color)', paddingBottom: '8px' }}>
                Measurements
              </h3>
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
                    <p style={{ fontSize: '18px', fontWeight: '600', marginTop: '4px' }}>
                      {measure.fieldValue} <span style={{ fontSize: '14px', color: 'var(--gray-color)' }}>{measure.unit}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Addons */}
          {product.addons && product.addons.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <h3 className="section-title" style={{ marginBottom: '16px', borderBottom: '2px solid var(--primary-color)', paddingBottom: '8px' }}>
                Addons
              </h3>
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
            </div>
          )}

          {/* Additional Fields (from Update API) */}
          {(product.fabricType || product.fabricColor || product.metersRequired) && (
            <div style={{ marginBottom: '32px' }}>
              <h3 className="section-title" style={{ marginBottom: '16px', borderBottom: '2px solid var(--primary-color)', paddingBottom: '8px' }}>
                Fabric Details
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                {product.fabricType && (
                  <div>
                    <label style={{ color: 'var(--gray-color)', fontSize: '14px' }}>Fabric Type</label>
                    <p style={{ fontSize: '16px', fontWeight: '600', marginTop: '4px' }}>{formatValue(product.fabricType)}</p>
                  </div>
                )}
                {product.fabricColor && (
                  <div>
                    <label style={{ color: 'var(--gray-color)', fontSize: '14px' }}>Fabric Color</label>
                    <p style={{ fontSize: '16px', fontWeight: '600', marginTop: '4px' }}>{formatValue(product.fabricColor)}</p>
                  </div>
                )}
                {product.metersRequired && (
                  <div>
                    <label style={{ color: 'var(--gray-color)', fontSize: '14px' }}>Meters Required</label>
                    <p style={{ fontSize: '16px', fontWeight: '600', marginTop: '4px' }}>{formatValue(product.metersRequired)}</p>
                  </div>
                )}
                {product.fabricNotes && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ color: 'var(--gray-color)', fontSize: '14px' }}>Fabric Notes</label>
                    <p style={{ fontSize: '16px', marginTop: '4px' }}>{formatValue(product.fabricNotes)}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Fusing Details */}
          {product.fusingRequired && (
            <div style={{ marginBottom: '32px' }}>
              <h3 className="section-title" style={{ marginBottom: '16px', borderBottom: '2px solid var(--primary-color)', paddingBottom: '8px' }}>
                Fusing Details
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                {product.fusingColor && (
                  <div>
                    <label style={{ color: 'var(--gray-color)', fontSize: '14px' }}>Fusing Color</label>
                    <p style={{ fontSize: '16px', fontWeight: '600', marginTop: '4px' }}>{formatValue(product.fusingColor)}</p>
                  </div>
                )}
                {product.fusingPricePerMeter && (
                  <div>
                    <label style={{ color: 'var(--gray-color)', fontSize: '14px' }}>Price per Meter</label>
                    <p style={{ fontSize: '16px', fontWeight: '600', marginTop: '4px' }}>{formatValue(product.fusingPricePerMeter)}</p>
                  </div>
                )}
                {product.totalFusingMeters && (
                  <div>
                    <label style={{ color: 'var(--gray-color)', fontSize: '14px' }}>Total Meters</label>
                    <p style={{ fontSize: '16px', fontWeight: '600', marginTop: '4px' }}>{formatValue(product.totalFusingMeters)}</p>
                  </div>
                )}
                {product.totalFusingPrice && (
                  <div>
                    <label style={{ color: 'var(--gray-color)', fontSize: '14px' }}>Total Fusing Price</label>
                    <p style={{ fontSize: '16px', fontWeight: '600', marginTop: '4px' }}>{formatValue(product.totalFusingPrice)}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Work Types */}
          {product.workTypes && product.workTypes.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <h3 className="section-title" style={{ marginBottom: '16px', borderBottom: '2px solid var(--primary-color)', paddingBottom: '8px' }}>
                Work Types
              </h3>
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
            </div>
          )}

          {/* Quantity & Price */}
          {(product.quantity || product.price) && (
            <div style={{ marginBottom: '32px' }}>
              <h3 className="section-title" style={{ marginBottom: '16px', borderBottom: '2px solid var(--primary-color)', paddingBottom: '8px' }}>
                Quantity & Price
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                {product.quantity && (
                  <div>
                    <label style={{ color: 'var(--gray-color)', fontSize: '14px' }}>Quantity</label>
                    <p style={{ fontSize: '24px', fontWeight: '600', marginTop: '4px', color: 'var(--primary-color)' }}>
                      {formatValue(product.quantity)}
                    </p>
                  </div>
                )}
                {product.price && (
                  <div>
                    <label style={{ color: 'var(--gray-color)', fontSize: '14px' }}>Price</label>
                    <p style={{ fontSize: '24px', fontWeight: '600', marginTop: '4px', color: 'var(--primary-color)' }}>
                      ₹{formatValue(product.price)}
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

export default ViewProduct;
