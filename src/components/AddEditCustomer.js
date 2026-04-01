import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaTrash, FaSpinner } from 'react-icons/fa';
import Sidebar from './Sidebar.js';
import ImageCropper from './ImageCropper.js';
import { customerAPI, uploadAPI } from '../services/api.js';
import { storage } from '../utils/storage';
import '../styles.css';
import { FiCamera, FiUser } from 'react-icons/fi';

const AddEditCustomer = ({ onLogout }) => {
  const navigate = useNavigate();
  const { customerId } = useParams();
  const fileInputRef = useRef(null);
  const isEditMode = Boolean(customerId);

  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    address: '',
    dob: '',
    reference: '',
    profile_pic: ''
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [showCropper, setShowCropper] = useState(false);
  const [imageToCrop, setImageToCrop] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (isEditMode && customerId) {
      fetchCustomerData();
    }
  }, [isEditMode, customerId]);

  const fetchCustomerData = async () => {
    setLoading(true);
    try {
      const data = await customerAPI.getCustomerById(customerId);
      if (data) {
        setFormData({
          fullName: data.fullName || '',
          mobile: data.mobile || '',
          address: data.address || '',
          dob: data.dob ? formatDateForInput(data.dob) : '',
          reference: data.reference || '',
          profile_pic: data.profile_pic || ''
        });
        if (data.profile_pic) {
          setImagePreview(data.profile_pic);
        }
      }
    } catch (err) {
      setError('Failed to fetch customer data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDateForInput = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  };

  const formatDateForAPI = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  };

  const handleLogout = () => {
    storage.clearAuthData();
    onLogout();
    navigate('/');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setImageToCrop(reader.result);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = async (croppedFile) => {
    setShowCropper(false);
    setImageToCrop('');
    setUploadingImage(true);

    try {
      const uploadResult = await uploadAPI.uploadImage(croppedFile);
      if (uploadResult && uploadResult.url) {
        setImagePreview(uploadResult.url);
        setFormData(prev => ({ ...prev, profile_pic: uploadResult.url }));
      }
    } catch (err) {
      setError('Failed to upload image. Please try again.');
      console.error(err);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteImage = () => {
    setImagePreview('');
    setFormData(prev => ({ ...prev, profile_pic: '' }));
    setShowCropper(false);
    setImageToCrop('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError('Full name is required');
      return false;
    }
    if (!formData.mobile.trim()) {
      setError('Mobile number is required');
      return false;
    }
    if (!/^[0-9]{10}$/.test(formData.mobile)) {
      setError('Please enter a valid 10-digit mobile number');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setSaving(true);
    try {
      const payload = {
        fullName: formData.fullName,
        mobile: formData.mobile,
        address: formData.address,
        dob: formatDateForAPI(formData.dob),
        reference: formData.reference,
        profile_pic: formData.profile_pic
      };

      if (isEditMode) {
        payload.customerId = customerId;
      }

      await customerAPI.saveCustomer(payload);
      navigate('/customers');
    } catch (err) {
      setError(err.message || 'Failed to save customer');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="settings-container">
        <Sidebar onLogout={handleLogout} />
        <div className="main-content">
          <div className="loading-container">
            <FaSpinner className="spinner" />
            <p>Loading customer data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-container">
      <Sidebar onLogout={handleLogout} />

      <div className="main-content">
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate('/customers')}>
            <FaArrowLeft /> Back to Customers
          </button>
          <h1 className="page-title">{isEditMode ? 'Edit Customer' : 'Add Customer'}</h1>
        </div>

        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError('')} className="close-error">×</button>
          </div>
        )}

        <div className="customer-form-container">
          <form onSubmit={handleSubmit} className="customer-form">
            {/* Profile Image Section */}
            <div className="form-section">
              <label className="section-label">Profile Image</label>
              <div className="profile-image-section">
                <div className="profile-image-wrapper" onClick={handleImageClick}>
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Profile Preview"
                      className="profile-image-preview"
                    />
                  ) : (
                    <div className="profile-image-placeholder">
                      <FiUser className="placeholder-icon" />
                      <span>Click to upload</span>
                    </div>
                  )}
                  {uploadingImage && (
                    <div className="image-uploading-overlay">
                      <FaSpinner className="spinner" />
                    </div>
                  )}
                  <div className="camera-icon">
                    <FiCamera />
                  </div>
                </div>

                {imagePreview && (
                  <button
                    type="button"
                    className="delete-image-btn"
                    onClick={handleDeleteImage}
                    disabled={uploadingImage}
                  >
                    <FaTrash /> Remove Image
                  </button>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
              </div>
            </div>

            {/* Form Fields */}
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="fullName">Full Name <span className="required">*</span></label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="mobile">Mobile Number <span className="required">*</span></label>
                <input
                  type="tel"
                  id="mobile"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  placeholder="Enter 10-digit mobile number"
                  maxLength="10"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="dob">Date of Birth</label>
                <input
                  type="date"
                  id="dob"
                  name="dob"
                  value={formData.dob}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="reference">Reference</label>
                <input
                  type="text"
                  id="reference"
                  name="reference"
                  value={formData.reference}
                  onChange={handleInputChange}
                  placeholder="e.g., Facebook, Instagram, Friend"
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="address">Address</label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter complete address"
                  rows="3"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/customers')}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving || uploadingImage}
              >
                {saving ? (
                  <><FaSpinner className="spinner" /> Saving...</>
                ) : (
                  isEditMode ? 'Update Customer' : 'Save Customer'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {showCropper && (
        <ImageCropper
          imageUrl={imageToCrop}
          onCropComplete={handleCropComplete}
          onCancel={() => {
            setShowCropper(false);
            setImageToCrop('');
          }}
          onDelete={handleDeleteImage}
        />
      )}
    </div>
  );
};

export default AddEditCustomer;
