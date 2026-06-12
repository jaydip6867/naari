import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar.js';
import '../styles.css';
import { storage } from '../utils/storage';
import { productAPI } from '../services/api';
import Pagination from './Pagination.js';
import { FiPlus, FiSearch, FiEdit2, FiEye, FiPackage } from 'react-icons/fi';

const Product = ({ onLogout }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const fetchProducts = async (search = '') => {
    try {
      setLoading(true);
      setError('');
      const response = await productAPI.getProducts(search);
      // API returns array directly or in Data property
      setProducts(Array.isArray(response) ? response : (response || []));
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.response.data.Message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  // local permission get logic start

  const permissions = JSON.parse(localStorage.getItem("naari_permissions")) || [];

  const productPermission = permissions.find(
    (item) => item.collectionName === "products"
  );

  const canAddEdit = productPermission?.insertUpdate || false;
  const canView = productPermission?.view || false;
  

  // local permission get logic end

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;

    setSearchQuery(value);
    setCurrentPage(1);

    fetchProducts(value);
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await productAPI.deleteProduct(productId);
      fetchProducts(searchQuery);
    } catch (err) {
      console.error('Error deleting product:', err);
      setError(err.response.data.Message || 'Failed to delete product');
    }
  };

  const handleLogout = () => {
    storage.clearAuthData();
    onLogout();
    navigate('/');
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(products.length / itemsPerPage);

  return (
    <div className="settings-container">
      <Sidebar onLogout={handleLogout} />

      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">Products</h1>
        </div>

        {error && (
          <div className="error-badge">
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
              {canAddEdit && (
                <button
                  className="add-btn"
                  onClick={() => navigate('/products/add')}
                >
                  <FiPlus style={{ marginRight: '6px' }} />
                  Add Product
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--primary-color)' }}>
              Loading products...
            </div>
          ) : products.length > 0 ? (
            <div className="table-container">
              <div className="table-scroll-wrapper">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Name</th>
                      <th>Outfit Type</th>
                      <th>Subcategory</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentProducts.map((product, index) => (
                      <tr key={product._id || index} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td >
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
                        <td >{product.name}</td>
                        <td >{product.outfitTypeName || '-'}</td>
                        <td >{product.subCategoryName || '-'}</td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            {canView && (
                              <button
                                className="edit-btn"
                                onClick={() => navigate(`/products/view/${product._id}`)}
                                title="View"
                              >
                                <FiEye />
                              </button>
                            )}

                            {canAddEdit && (
                              <button
                                className="edit-btn"
                                onClick={() => navigate(`/products/edit/${product._id}`)}
                                title="Edit"
                              >
                                <FiEdit2 />
                              </button>
                            )}
                            {/* <button 
                            className="delete-btn"
                            onClick={() => handleDeleteProduct(product._id)}
                            title="Delete"
                          >
                            <FiTrash2 />
                          </button> */}
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
