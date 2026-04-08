import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar.js';
import '../styles.css';
import { storage } from '../utils/storage';
import { productAPI } from '../services/api';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiEye, FiPackage } from 'react-icons/fi';

const Product = ({ onLogout }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchProducts = async (search = '') => {
    try {
      setLoading(true);
      setError('');
      const response = await productAPI.getProducts(search);
      // API returns array directly or in Data property
      setProducts(Array.isArray(response) ? response : (response || []));
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    fetchProducts(e.target.value);
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await productAPI.deleteProduct(productId);
      fetchProducts(searchQuery);
    } catch (err) {
      console.error('Error deleting product:', err);
      setError(err.message || 'Failed to delete product');
    }
  };

  const handleLogout = () => {
    storage.clearAuthData();
    onLogout();
    navigate('/');
  };

  return (
    <div className="settings-container">
      <Sidebar onLogout={handleLogout} />
      
      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">Products</h1>
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
          <div className="section-header" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <h2 className="section-title">Product List</h2>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
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
                onClick={() => navigate('/products/add')}
              >
                <FiPlus style={{ marginRight: '6px' }} />
                Add Product
              </button>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--primary-color)' }}>
              Loading products...
            </div>
          ) : products.length > 0 ? (
            <div className="table-container" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--background-light)', borderBottom: '2px solid var(--border-color)' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--primary-dark)' }}>Image</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--primary-dark)' }}>Name</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--primary-dark)' }}>Outfit Type</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--primary-dark)' }}>Subcategory</th>
                    <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: 'var(--primary-dark)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, index) => (
                    <tr key={product._id || index} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px' }}>
                        <div style={{ width: '50px', height: '50px', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background-light)', border: '1px solid var(--border-color)' }}>
                          {product.outfitStyleRefImg && product.outfitStyleRefImg.length > 0 ? (
                            <img
                              src={product.outfitStyleRefImg[0]}
                              alt={product.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <FiPackage size={24} color="var(--gray-color)" />
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '12px' }}>{product.name}</td>
                      <td style={{ padding: '12px' }}>{product.outfitTypeId?.name || '-'}</td>
                      <td style={{ padding: '12px' }}>{product.subCategoryName || '-'}</td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button 
                            className="edit-btn"
                            onClick={() => navigate(`/products/view/${product._id}`)}
                            title="View"
                          >
                            <FiEye />
                          </button>
                          <button 
                            className="edit-btn"
                            onClick={() => navigate(`/products/edit/${product._id}`)}
                            title="Edit"
                          >
                            <FiEdit2 />
                          </button>
                          <button 
                            className="delete-btn"
                            onClick={() => handleDeleteProduct(product._id)}
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
              <p>No products found</p>
              <button 
                className="add-btn" 
                onClick={() => navigate('/products/add')}
                style={{ marginTop: '16px' }}
              >
                <FiPlus style={{ marginRight: '6px' }} />
                Add Your First Product
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Product;
