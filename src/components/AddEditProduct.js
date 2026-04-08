import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from './Sidebar.js';
import '../styles.css';
import { storage } from '../utils/storage';
import { productAPI } from '../services/api';
import { measurementsAPI, addonsAPI, uploadAPI } from '../services/api';
import { FiPlus, FiTrash2, FiUpload, FiX } from 'react-icons/fi';

const AddEditProduct = ({ onLogout }) => {
  const navigate = useNavigate();
  const { productId } = useParams();
  const isEditMode = !!productId;

  // Loading states
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Dropdown data
  const [outfitTypes, setOutfitTypes] = useState([]);
  const [availableAddons, setAvailableAddons] = useState([]);

  // Form state - includes Create and Update Product API fields
  const [formData, setFormData] = useState({
    // Create Product fields
    name: '',
    outfitTypeId: '',
    subCategoryName: '',
    outfitStyleRefImg: [],
    measurement: [],
    addons: [],
    // Update Product additional fields
    fabricType: '',
    fabricColor: '',
    metersRequired: '',
    fabricNotes: '',
    fusingRequired: false,
    fusingColor: '',
    fusingPricePerMeter: '',
    totalFusingMeters: '',
    totalFusingPrice: '',
    workTypes: [],
    embroideryWorkNotes: '',
    embroideryRefImg: [],
    assignWorker: '',
    stitichingStyle: '',
    stitichingNotes: '',
    stitichingRefImg: [],
    otherWork: '',
    otherWorkRefImg: [],
    quantity: '',
    price: ''
  });

  // Store actual file objects for upload
  const [imageFiles, setImageFiles] = useState([]);

  // Fetch initial data
  useEffect(() => {
    fetchOutfitTypes();
    if (isEditMode && productId) {
      fetchProduct();
    }
  }, [productId]);

  // Fetch addons and outfit fields when outfit type changes
  useEffect(() => {
    if (formData.outfitTypeId) {
      fetchAddons(formData.outfitTypeId);
      populateMeasurementsFromOutfitType(formData.outfitTypeId);
    }
  }, [formData.outfitTypeId]);

  const fetchOutfitTypes = async () => {
    try {
      const data = await measurementsAPI.getOutfitTypes();
      setOutfitTypes(data || []);
    } catch (err) {
      console.error('Error fetching outfit types:', err);
    }
  };

  const fetchAddons = async (outfitTypeId) => {
    try {
      const data = await addonsAPI.getAddons('', outfitTypeId);
      setAvailableAddons(data || []);
      
      // Get existing addon data (when editing)
      const existingAddons = formData.addons || [];
      
      // Initialize addons from available addons, merging with existing data
      const initialAddons = (data || []).map(addon => {
        // Find if this addon was previously selected
        const existingAddon = existingAddons.find(
          ea => ea.title === addon.title && ea.fieldType === addon.fieldType
        );
        
        return {
          title: addon.title,
          fieldType: addon.fieldType,
          options: addon.options || [],
          isSelected: existingAddon ? existingAddon.isSelected : false,
          value: existingAddon ? existingAddon.value : ''
        };
      });
      
      setFormData(prev => ({ ...prev, addons: initialAddons }));
    } catch (err) {
      console.error('Error fetching addons:', err);
    }
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const data = await productAPI.getProductById(productId);
      if (data) {
        setFormData({
          // Create Product fields
          name: data.name || '',
          outfitTypeId: data.outfitTypeId?._id || data.outfitTypeId || '',
          subCategoryName: data.subCategoryName || '',
          outfitStyleRefImg: data.outfitStyleRefImg || [],
          measurement: data.measurement || [],
          addons: data.addons || [],
          // Update Product additional fields
          fabricType: data.fabricType || '',
          fabricColor: data.fabricColor || '',
          metersRequired: data.metersRequired || '',
          fabricNotes: data.fabricNotes || '',
          fusingRequired: data.fusingRequired || false,
          fusingColor: data.fusingColor || '',
          fusingPricePerMeter: data.fusingPricePerMeter || '',
          totalFusingMeters: data.totalFusingMeters || '',
          totalFusingPrice: data.totalFusingPrice || '',
          workTypes: data.workTypes || [],
          embroideryWorkNotes: data.embroideryWorkNotes || '',
          embroideryRefImg: data.embroideryRefImg || [],
          assignWorker: data.assignWorker || '',
          stitichingStyle: data.stitichingStyle || '',
          stitichingNotes: data.stitichingNotes || '',
          stitichingRefImg: data.stitichingRefImg || [],
          otherWork: data.otherWork || '',
          otherWorkRefImg: data.otherWorkRefImg || [],
          quantity: data.quantity || '',
          price: data.price || ''
        });
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      setError(err.message || 'Failed to fetch product');
    } finally {
      setLoading(false);
    }
  };

  const getSelectedOutfit = () => {
    return outfitTypes.find(o => o._id === formData.outfitTypeId);
  };

  const populateMeasurementsFromOutfitType = (outfitTypeId) => {
    const selectedOutfit = outfitTypes.find(o => o._id === outfitTypeId);
    if (selectedOutfit?.fields && selectedOutfit.fields.length > 0) {
      // Create measurements from outfit type fields
      // API field structure: { label: "Chest", unit: "inch", isRequired: false }
      const outfitMeasurements = selectedOutfit.fields.map(field => ({
        fieldLable: field.label || '',
        unit: field.unit || 'inch',
        fieldValue: ''
      }));
      
      setFormData(prev => ({
        ...prev,
        measurement: outfitMeasurements
      }));
    } else {
      // Clear measurements if no fields defined
      setFormData(prev => ({
        ...prev,
        measurement: []
      }));
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMeasurementChange = (index, field, value) => {
    const newMeasurements = [...formData.measurement];
    newMeasurements[index] = { ...newMeasurements[index], [field]: value };
    setFormData(prev => ({ ...prev, measurement: newMeasurements }));
  };

  const addMeasurement = () => {
    setFormData(prev => ({
      ...prev,
      measurement: [...prev.measurement, { fieldLable: '', unit: 'inch', fieldValue: '' }]
    }));
  };

  const removeMeasurement = (index) => {
    setFormData(prev => ({
      ...prev,
      measurement: prev.measurement.filter((_, i) => i !== index)
    }));
  };

  const handleAddonChange = (index, field, value) => {
    const newAddons = [...formData.addons];
    newAddons[index] = { ...newAddons[index], [field]: value };
    if (field === 'isSelected' && !value) {
      newAddons[index].value = '';
    }
    setFormData(prev => ({ ...prev, addons: newAddons }));
  };

  const handleImageUpload = async (field, files) => {
    // Store file objects for later upload and preview URLs for display
    const newFiles = Array.from(files);
    const previewUrls = newFiles.map(file => URL.createObjectURL(file));
    
    setImageFiles(prev => [...prev, ...newFiles]);
    setFormData(prev => ({ ...prev, [field]: [...prev[field], ...previewUrls] }));
  };

  const removeImage = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
    // Also remove from file list if it exists
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError('');

      let uploadedImageUrls = [];

      // Upload images if there are new files
      if (imageFiles.length > 0) {
        const uploadResponse = await uploadAPI.uploadMultipleImages(imageFiles);
        uploadedImageUrls = uploadResponse?.urls || uploadResponse || [];
      }

      // Filter only selected addons
      const selectedAddons = formData.addons.filter(a => a.isSelected);

      // Build payload with uploaded image URLs
      // Keep existing URLs (from edit mode) and add new uploaded URLs
      const existingUrls = formData.outfitStyleRefImg.filter(url => !url.startsWith('blob:'));
      const finalImageUrls = [...existingUrls, ...uploadedImageUrls];

      const payload = {
        name: formData.name,
        outfitTypeId: formData.outfitTypeId,
        subCategoryName: formData.subCategoryName,
        outfitStyleRefImg: finalImageUrls,
        measurement: formData.measurement,
        addons: selectedAddons
      };

      if (isEditMode) {
        // Add all Update Product API fields
        const updatePayload = {
          ...payload,
          productId,
          fabricType: formData.fabricType,
          fabricColor: formData.fabricColor,
          metersRequired: parseFloat(formData.metersRequired) || 0,
          fabricNotes: formData.fabricNotes,
          fusingRequired: formData.fusingRequired,
          fusingColor: formData.fusingColor,
          fusingPricePerMeter: parseFloat(formData.fusingPricePerMeter) || 0,
          totalFusingMeters: parseFloat(formData.totalFusingMeters) || 0,
          totalFusingPrice: parseFloat(formData.totalFusingPrice) || 0,
          workTypes: formData.workTypes,
          embroideryWorkNotes: formData.embroideryWorkNotes,
          embroideryRefImg: formData.embroideryRefImg,
          assignWorker: formData.assignWorker,
          stitichingStyle: formData.stitichingStyle,
          stitichingNotes: formData.stitichingNotes,
          stitichingRefImg: formData.stitichingRefImg,
          otherWork: formData.otherWork,
          otherWorkRefImg: formData.otherWorkRefImg,
          quantity: parseInt(formData.quantity) || 0,
          price: parseFloat(formData.price) || 0
        };
        await productAPI.updateProduct(updatePayload);
      } else {
        await productAPI.createProduct(payload);
      }

      navigate('/products');
    } catch (err) {
      console.error('Error saving product:', err);
      setError(err.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    storage.clearAuthData();
    onLogout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="settings-container">
        <Sidebar onLogout={handleLogout} />
        <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  const selectedOutfit = getSelectedOutfit();

  return (
    <div className="settings-container">
      <Sidebar onLogout={handleLogout} />
      
      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">{isEditMode ? 'Edit Product' : 'Add Product'}</h1>
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

        <form onSubmit={handleSubmit} className="content-section product-form">
          {/* Basic Information */}
          <div className="form-section">
            <h3 className="section-title form-section-title">Basic Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Product Name <span className="required">*</span></label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter product name"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Outfit Type <span className="required">*</span></label>
                <select
                  className="input-field"
                  value={formData.outfitTypeId}
                  onChange={(e) => handleInputChange('outfitTypeId', e.target.value)}
                  required
                >
                  <option value="">Select Outfit Type</option>
                  {outfitTypes.map(outfit => (
                    <option key={outfit._id} value={outfit._id}>{outfit.name}</option>
                  ))}
                </select>
              </div>

              {selectedOutfit?.hasSubCategories && (
                <div className="form-group">
                  <label className="form-label">Subcategory <span className="required">*</span></label>
                  <select
                    className="input-field"
                    value={formData.subCategoryName}
                    onChange={(e) => handleInputChange('subCategoryName', e.target.value)}
                    required={selectedOutfit?.hasSubCategories}
                  >
                    <option value="">Select Subcategory</option>
                    {selectedOutfit?.subCategories?.map(sub => (
                      <option key={sub.name} value={sub.name}>{sub.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Outfit Style Reference Images */}
            <div className="form-group full-width" style={{ marginTop: '24px' }}>
              <label className="form-label">Outfit Style Reference Images</label>
              <div className="image-upload-container">
                {formData.outfitStyleRefImg.map((img, index) => (
                  <div key={index} className="image-preview">
                    <img src={img} alt={`Style ${index + 1}`} />
                    <button
                      type="button"
                      className="image-remove-btn"
                      onClick={() => removeImage('outfitStyleRefImg', index)}
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                ))}
                <label className="image-upload-btn">
                  <FiUpload size={24} />
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleImageUpload('outfitStyleRefImg', e.target.files)}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Measurements - Auto-populated from Outfit Type */}
          {formData.measurement.length > 0 && (
            <div className="form-section">
              <h3 className="section-title form-section-title">Measurements</h3>
              <div className="measurements-grid">
                {formData.measurement.map((measure, index) => (
                  <div key={index} className="measurement-item">
                    <div className="form-group">
                      <label className="form-label">Field Label</label>
                      <input
                        type="text"
                        className="input-field input-disabled"
                        value={measure.fieldLable}
                        disabled
                      />
                    </div>
                    <div className="form-group" style={{ width: '100px' }}>
                      <label className="form-label">Unit</label>
                      <select
                        className="input-field input-disabled"
                        value={measure.unit}
                        disabled
                      >
                        <option value="inch">inch</option>
                        <option value="cm">cm</option>
                        <option value="feet">feet</option>
                      </select>
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">Value</label>
                      <input
                        type="number"
                        step="0.01"
                        className="input-field"
                        value={measure.fieldValue}
                        onChange={(e) => handleMeasurementChange(index, 'fieldValue', e.target.value)}
                        placeholder="Enter value"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Addons */}
          {availableAddons.length > 0 && (
            <div className="form-section">
              <h3 className="section-title form-section-title">Addons</h3>
              <div className="addons-grid">
                {formData.addons.map((addon, index) => (
                  <div key={index} className={`addon-card ${addon.isSelected ? 'selected' : ''}`}>
                    <div className="addon-header">
                      <input
                        type="checkbox"
                        id={`addon-${index}`}
                        className="addon-checkbox"
                        checked={addon.isSelected}
                        onChange={(e) => handleAddonChange(index, 'isSelected', e.target.checked)}
                      />
                      <label htmlFor={`addon-${index}`} className="addon-title">{addon.title}</label>
                      <span className="addon-type">({addon.fieldType})</span>
                    </div>
                    
                    {addon.isSelected && (
                      <div className="addon-content">
                        {addon.fieldType === 'text' && (
                          <input
                            type="text"
                            className="input-field"
                            placeholder="Enter value"
                            value={addon.value}
                            onChange={(e) => handleAddonChange(index, 'value', e.target.value)}
                          />
                        )}
                        {addon.fieldType === 'radio' && (
                          <div className="radio-group">
                            {addon.options.map((option, optIndex) => (
                              <label key={optIndex} className="radio-label">
                                <input
                                  type="radio"
                                  name={`addon-${index}-option`}
                                  checked={addon.value === option}
                                  onChange={() => handleAddonChange(index, 'value', option)}
                                />
                                <span>{option}</span>
                              </label>
                            ))}
                          </div>
                        )}
                        {addon.fieldType === 'checkbox' && (
                          <div className="checkbox-group">
                            {addon.options.map((option, optIndex) => (
                              <label key={optIndex} className="checkbox-label">
                                <input
                                  type="checkbox"
                                  checked={addon.value?.includes(option)}
                                  onChange={(e) => {
                                    const currentValues = addon.value ? addon.value.split(',') : [];
                                    const newValues = e.target.checked
                                      ? [...currentValues, option]
                                      : currentValues.filter(v => v !== option);
                                    handleAddonChange(index, 'value', newValues.join(','));
                                  }}
                                />
                                <span>{option}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Update Product Additional Fields - Only in Edit Mode */}
          {isEditMode && (
            <>
              {/* Fabric Details */}
              <div className="form-section">
                <h3 className="section-title form-section-title">Fabric Details</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Fabric Type</label>
                    <input
                      type="text"
                      className="input-field"
                      value={formData.fabricType}
                      onChange={(e) => handleInputChange('fabricType', e.target.value)}
                      placeholder="e.g., Cotton"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Fabric Color</label>
                    <input
                      type="text"
                      className="input-field"
                      value={formData.fabricColor}
                      onChange={(e) => handleInputChange('fabricColor', e.target.value)}
                      placeholder="e.g., Maroon"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Meters Required</label>
                    <input
                      type="number"
                      step="0.1"
                      className="input-field"
                      value={formData.metersRequired}
                      onChange={(e) => handleInputChange('metersRequired', e.target.value)}
                      placeholder="e.g., 3.5"
                    />
                  </div>
                  <div className="form-group full-width">
                    <label className="form-label">Fabric Notes</label>
                    <textarea
                      className="input-field"
                      rows="2"
                      value={formData.fabricNotes}
                      onChange={(e) => handleInputChange('fabricNotes', e.target.value)}
                      placeholder="Enter fabric notes..."
                    />
                  </div>
                </div>
              </div>

              {/* Fusing Details */}
              <div className="form-section">
                <h3 className="section-title form-section-title">Fusing Details</h3>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.fusingRequired}
                      onChange={(e) => handleInputChange('fusingRequired', e.target.checked)}
                    />
                    <span>Fusing Required</span>
                  </label>
                </div>
                {formData.fusingRequired && (
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Fusing Color</label>
                      <input
                        type="text"
                        className="input-field"
                        value={formData.fusingColor}
                        onChange={(e) => handleInputChange('fusingColor', e.target.value)}
                        placeholder="e.g., Black"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Price per Meter</label>
                      <input
                        type="number"
                        step="0.1"
                        className="input-field"
                        value={formData.fusingPricePerMeter}
                        onChange={(e) => handleInputChange('fusingPricePerMeter', e.target.value)}
                        placeholder="e.g., 3"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Total Fusing Meters</label>
                      <input
                        type="number"
                        step="0.1"
                        className="input-field"
                        value={formData.totalFusingMeters}
                        onChange={(e) => handleInputChange('totalFusingMeters', e.target.value)}
                        placeholder="e.g., 1.5"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Total Fusing Price</label>
                      <input
                        type="number"
                        step="0.1"
                        className="input-field"
                        value={formData.totalFusingPrice}
                        onChange={(e) => handleInputChange('totalFusingPrice', e.target.value)}
                        placeholder="e.g., 4.5"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Work Types */}
              <div className="form-section">
                <h3 className="section-title form-section-title">Work Types</h3>
                <div className="form-group full-width">
                  <label className="form-label">Work Types (comma separated)</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.workTypes.join(', ')}
                    onChange={(e) => handleInputChange('workTypes', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                    placeholder="e.g., HANDWORK, ZARI WORK"
                  />
                </div>
              </div>

              {/* Embroidery & Stitching */}
              <div className="form-section">
                <h3 className="section-title form-section-title">Embroidery & Stitching</h3>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label className="form-label">Embroidery Work Notes</label>
                    <textarea
                      className="input-field"
                      rows="2"
                      value={formData.embroideryWorkNotes}
                      onChange={(e) => handleInputChange('embroideryWorkNotes', e.target.value)}
                      placeholder="Enter embroidery notes..."
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Assign Worker</label>
                    <input
                      type="text"
                      className="input-field"
                      value={formData.assignWorker}
                      onChange={(e) => handleInputChange('assignWorker', e.target.value)}
                      placeholder="Worker ID"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Stitching Style</label>
                    <input
                      type="text"
                      className="input-field"
                      value={formData.stitichingStyle}
                      onChange={(e) => handleInputChange('stitichingStyle', e.target.value)}
                      placeholder="e.g., Regular"
                    />
                  </div>
                  <div className="form-group full-width">
                    <label className="form-label">Stitching Notes</label>
                    <textarea
                      className="input-field"
                      rows="2"
                      value={formData.stitichingNotes}
                      onChange={(e) => handleInputChange('stitichingNotes', e.target.value)}
                      placeholder="Enter stitching notes..."
                    />
                  </div>
                </div>
              </div>

              {/* Other Work */}
              <div className="form-section">
                <h3 className="section-title form-section-title">Other Work</h3>
                <div className="form-group full-width">
                  <label className="form-label">Other Work Details</label>
                  <textarea
                    className="input-field"
                    rows="2"
                    value={formData.otherWork}
                    onChange={(e) => handleInputChange('otherWork', e.target.value)}
                    placeholder="Enter other work details..."
                  />
                </div>
              </div>

              {/* Quantity & Price */}
              <div className="form-section">
                <h3 className="section-title form-section-title">Quantity & Price</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Quantity</label>
                    <input
                      type="number"
                      className="input-field"
                      value={formData.quantity}
                      onChange={(e) => handleInputChange('quantity', e.target.value)}
                      placeholder="e.g., 50"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Price (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="input-field"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      placeholder="e.g., 1000"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-cancel"
              onClick={() => navigate('/products')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-save"
              disabled={saving}
            >
              {saving ? 'Saving...' : (isEditMode ? 'Update Product' : 'Create Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditProduct;
