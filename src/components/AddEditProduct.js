import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from './Sidebar.js';
import '../styles.css';
import { storage } from '../utils/storage';
import { productAPI } from '../services/api';
import { measurementsAPI, addonsAPI, uploadAPI, staffAPI } from '../services/api';
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
  const [staffList, setStaffList] = useState([]);

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
    workTypes: [],
    fabricRefImg: [],
    workTypeRefImg: [],
    embroideryWorkNotes: '',
    embroideryRefImg: [],
    assignWorker: [], // Array of {workerId, status} objects
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
  const [activeTab, setActiveTab] = useState('basic');

  // Tab configuration - show only 3 tabs for create mode, all tabs for edit mode
  const tabs = isEditMode ? [
    { id: 'basic', label: 'Basic' },
    { id: 'measurements', label: 'Measurements' },
    { id: 'addons', label: 'Addons' },
    { id: 'fabric', label: 'Fabric' },
    { id: 'fusing', label: 'Fusing' },
    { id: 'worktype', label: 'Work Types' },
    { id: 'embroidery', label: 'Embroidery & Stitching' },
    { id: 'other', label: 'Other' },
    { id: 'quantityprice', label: 'Quantity & Price' }
  ] : [
    { id: 'basic', label: 'Basic' },
    { id: 'measurements', label: 'Measurements' },
    { id: 'addons', label: 'Addons' }
  ];

  // Fetch initial data
  useEffect(() => {
    fetchOutfitTypes();
    fetchStaff();
    if (isEditMode && productId) {
      fetchProduct();
    }
  }, [productId]);

  // Fetch addons and outfit fields when outfit type or subcategory changes
  useEffect(() => {
    if (formData.outfitTypeId) {
      fetchAddons(formData.outfitTypeId);
      // Only auto-populate measurements from outfit type for new products
      // For edit mode, preserve the product's saved measurements
      if (!isEditMode) {
        populateMeasurementsFromOutfitType(formData.outfitTypeId, formData.subCategoryName);
      }
    }
  }, [formData.outfitTypeId, formData.subCategoryName, isEditMode]);

  const fetchOutfitTypes = async () => {
    try {
      const data = await measurementsAPI.getOutfitTypes();
      setOutfitTypes(data || []);
    } catch (err) {
      console.error('Error fetching outfit types:', err);
    }
  };

  const fetchStaff = async () => {
    try {
      const data = await staffAPI.getStaff();
      setStaffList(data || []);
    } catch (err) {
      console.error('Error fetching staff:', err);
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
        const outfitTypeId = data.outfitTypeId?._id || data.outfitTypeId || '';

        // Merge saved measurements with outfit type/subcategory fields to ensure all fields are shown
        const mergedMeasurements = mergeMeasurementsWithOutfitType(outfitTypeId, data.measurement, data.subCategoryName);

        setFormData({
          // Create Product fields
          name: data.name || '',
          outfitTypeId: outfitTypeId,
          subCategoryName: data.subCategoryName || '',
          outfitStyleRefImg: data.outfitStyleRefImg || [],
          measurement: mergedMeasurements,
          addons: data.addons || [],
          // Update Product additional fields
          fabricType: data.fabricType || '',
          fabricColor: data.fabricColor || '',
          metersRequired: data.metersRequired || '',
          fabricNotes: data.fabricNotes || '',
          fusingRequired: data.fusingRequired || false,
          fusingColor: data.fusingColor || '',
          workTypes: data.workTypes || [],
          fabricRefImg: data.fabricRefImg || [],
          workTypeRefImg: data.workTypeRefImg || [],
          embroideryWorkNotes: data.embroideryWorkNotes || '',
          embroideryRefImg: data.embroideryRefImg || [],
          assignWorker: Array.isArray(data.assignWorker)
            ? data.assignWorker.map(w => {
                // Handle case where workerId is an object with _id
                const workerId = w.workerId?._id || w.workerId || '';
                return { workerId, status: w.status || 'order_overview' };
              })
            : [],
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

  const populateMeasurementsFromOutfitType = (outfitTypeId, subCategoryName = null) => {
    const selectedOutfit = outfitTypes.find(o => o._id === outfitTypeId);
    let fields = [];

    if (selectedOutfit) {
      // If has subcategories and subcategory is selected, get fields from subcategory
      if (selectedOutfit.hasSubCategories && subCategoryName && selectedOutfit.subCategories) {
        const subCategory = selectedOutfit.subCategories.find(s => s.name === subCategoryName);
        if (subCategory && subCategory.fields && subCategory.fields.length > 0) {
          fields = subCategory.fields;
        }
      }
      // Otherwise get fields from main outfit type
      else if (selectedOutfit.fields && selectedOutfit.fields.length > 0) {
        fields = selectedOutfit.fields;
      }
    }

    if (fields.length > 0) {
      // Create measurements from fields
      const outfitMeasurements = fields.map(field => ({
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

  // For edit mode: Merge outfit type/subcategory fields with existing product measurements
  const mergeMeasurementsWithOutfitType = (outfitTypeId, existingMeasurements, subCategoryName = null) => {
    const selectedOutfit = outfitTypes.find(o => o._id === outfitTypeId);
    if (!selectedOutfit) {
      return existingMeasurements || [];
    }

    let fields = [];

    // If has subcategories and subcategory is selected, get fields from subcategory
    if (selectedOutfit.hasSubCategories && subCategoryName && selectedOutfit.subCategories) {
      const subCategory = selectedOutfit.subCategories.find(s => s.name === subCategoryName);
      if (subCategory && subCategory.fields) {
        fields = subCategory.fields;
      }
    }
    // Otherwise get fields from main outfit type
    else if (selectedOutfit.fields) {
      fields = selectedOutfit.fields;
    }

    if (fields.length === 0) {
      return existingMeasurements || [];
    }

    // Create a map of existing measurements by field label for quick lookup
    const existingMap = new Map();
    (existingMeasurements || []).forEach(m => {
      existingMap.set(m.fieldLable, m);
    });

    // Merge: Use existing values where available, otherwise create new with empty value
    const mergedMeasurements = fields.map(field => {
      const existing = existingMap.get(field.label);
      return {
        fieldLable: field.label || '',
        unit: field.unit || 'inch',
        fieldValue: existing ? existing.fieldValue : ''
      };
    });

    return mergedMeasurements;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Add work type
  const addWorkType = (workType) => {
    if (workType && !formData.workTypes.includes(workType)) {
      setFormData(prev => ({
        ...prev,
        workTypes: [...prev.workTypes, workType]
      }));
    }
  };

  // Remove work type
  const removeWorkType = (workType) => {
    setFormData(prev => ({
      ...prev,
      workTypes: prev.workTypes.filter(w => w !== workType)
    }));
  };

  // Add a new worker assignment
  const addWorkerAssignment = () => {
    setFormData(prev => ({
      ...prev,
      assignWorker: [...prev.assignWorker, { workerId: '', status: 'order_overview' }]
    }));
  };

  // Remove a worker assignment
  const removeWorkerAssignment = (index) => {
    setFormData(prev => ({
      ...prev,
      assignWorker: prev.assignWorker.filter((_, i) => i !== index)
    }));
  };

  // Update worker assignment field
  const handleWorkerAssignmentChange = (index, field, value) => {
    setFormData(prev => {
      const updated = [...prev.assignWorker];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, assignWorker: updated };
    });
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

      // Separate fabricRefImg URLs - keep existing, add new uploaded ones
      const existingFabricUrls = formData.fabricRefImg.filter(url => !url.startsWith('blob:'));
      const finalFabricUrls = [...existingFabricUrls, ...uploadedImageUrls];

      // Separate workTypeRefImg URLs - keep existing, add new uploaded ones
      const existingWorkTypeUrls = formData.workTypeRefImg.filter(url => !url.startsWith('blob:'));
      const finalWorkTypeUrls = [...existingWorkTypeUrls, ...uploadedImageUrls];

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
          workTypes: formData.workTypes,
          fabricRefImg: finalFabricUrls,
          workTypeRefImg: finalWorkTypeUrls,
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
        navigate('/products');
      } else {
        const newProduct = await productAPI.createProduct(payload);
        navigate(`/products/edit/${newProduct._id}`);
      }
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

  // Tab change handler
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  // Render tab navigation
  const renderTabNavigation = () => (
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
  );

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

        {renderTabNavigation()}
        <form onSubmit={handleSubmit} className="content-section product-form">
          {/* Basic Information Tab */}
          {activeTab === 'basic' && (
            <div className="tab-content">
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
            </div>
          )}

          {/* Measurements Tab */}
          {activeTab === 'measurements' && formData.measurement.length > 0 && (
            <div className="tab-content">
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
            </div>
          )}

          {/* Addons Tab */}
          {activeTab === 'addons' && availableAddons.length > 0 && (
            <div className="tab-content">
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
            </div>
          )}

          {/* Edit Mode Only Tabs */}
          {isEditMode && (
            <>
              {/* Fabric Tab */}
              {activeTab === 'fabric' && (
                <div className="tab-content">
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
                  {/* Fabric Reference Images */}
                  <div className="form-group full-width" style={{ marginTop: '16px' }}>
                    <label className="form-label">Fabric Reference Images</label>
                    <div className="image-upload-container">
                      {formData.fabricRefImg.map((img, index) => (
                        <div key={index} className="image-preview">
                          <img src={img} alt={`Fabric ${index + 1}`} />
                          <button
                            type="button"
                            className="image-remove-btn"
                            onClick={() => removeImage('fabricRefImg', index)}
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
                          onChange={(e) => handleImageUpload('fabricRefImg', e.target.files)}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
                </div>
              )}

              {/* Fusing Tab */}
              {activeTab === 'fusing' && (
                <div className="tab-content">
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
                  </div>
                )}
              </div>
                </div>
              )}

              {/* Work Type Tab */}
              {activeTab === 'worktype' && (
                <div className="tab-content">
                  <div className="form-section">
                    <h3 className="section-title form-section-title">Work Types</h3>
                <div className="form-group full-width">
                  <label className="form-label">Work Types</label>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    <input
                      type="text"
                      className="input-field"
                      id="workTypeInput"
                      placeholder="e.g., HANDWORK"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addWorkType(e.target.value.trim());
                          e.target.value = '';
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="btn add-btn"
                      onClick={() => {
                        const input = document.getElementById('workTypeInput');
                        addWorkType(input.value.trim());
                        input.value = '';
                      }}
                    >
                      <FiPlus size={16} /> Add
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {formData.workTypes.map((workType, index) => (
                      <span
                        key={index}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '6px 12px',
                          background: 'var(--primary-light)',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '14px',
                          color: 'var(--primary-color)'
                        }}
                      >
                        {workType}
                        <button
                          type="button"
                          onClick={() => removeWorkType(workType)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '2px',
                            display: 'flex',
                            alignItems: 'center',
                            color: 'var(--primary-color)'
                          }}
                        >
                          <FiX size={14} />
                        </button>
                      </span>
                    ))}
                    {formData.workTypes.length === 0 && (
                      <span style={{ color: 'var(--gray-color)', fontStyle: 'italic' }}>
                        No work types added. Enter a work type and click Add.
                      </span>
                    )}
                  </div>
                  {/* Work Type Reference Images */}
                  <div className="form-group full-width" style={{ marginTop: '16px' }}>
                    <label className="form-label">Work Type Reference Images</label>
                    <div className="image-upload-container">
                      {formData.workTypeRefImg.map((img, index) => (
                        <div key={index} className="image-preview">
                          <img src={img} alt={`Work Type ${index + 1}`} />
                          <button
                            type="button"
                            className="image-remove-btn"
                            onClick={() => removeImage('workTypeRefImg', index)}
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
                          onChange={(e) => handleImageUpload('workTypeRefImg', e.target.files)}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
                </div>
              )}

              {/* Embroidery & Stitching Tab */}
              {activeTab === 'embroidery' && (
                <div className="tab-content">
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
                  <div className="form-group full-width">
                    <label className="form-label">Assign Workers</label>
                    {formData.assignWorker.map((assignment, index) => (
                      <div key={index} className="worker-assignment-row" style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                        <select
                          className="input-field"
                          style={{ flex: 1 }}
                          value={assignment.workerId}
                          onChange={(e) => handleWorkerAssignmentChange(index, 'workerId', e.target.value)}
                        >
                          <option value="">Select Worker</option>
                          {staffList.map((staff) => (
                            <option key={staff._id} value={staff._id}>
                              {staff.fullName}
                            </option>
                          ))}
                        </select>
                        <select
                          className="input-field"
                          style={{ flex: 1 }}
                          value={assignment.status}
                          onChange={(e) => handleWorkerAssignmentChange(index, 'status', e.target.value)}
                        >
                          <option value="order_overview">Order Overview</option>
                          <option value="fabric_purchase">Fabric Purchase</option>
                          <option value="dying">Dying</option>
                          <option value="fusing">Fusing</option>
                          <option value="khakha">Khakha</option>
                          <option value="art_work">Art Work</option>
                          <option value="add_ons">Add Ons</option>
                          <option value="cutting">Cutting</option>
                          <option value="stitching">Stitching</option>
                          <option value="qc">QC</option>
                          <option value="other_work">Other Work</option>
                          <option value="packing">Packing</option>
                          <option value="ready_to_delivery">Ready to Delivery</option>
                          <option value="delivery_complete">Delivery Complete</option>
                          <option value="repairing">Repairing</option>
                        </select>
                        <button
                          type="button"
                          className="btn-icon btn"
                          onClick={() => removeWorkerAssignment(index)}
                          style={{ padding: '8px' }}
                        >
                          <FiTrash2 size={16} className='delete-icon' />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="add-btn"
                      onClick={addWorkerAssignment}
                      style={{ marginTop: '8px', justifyContent: 'center' }}
                    >
                      <FiPlus size={16} /> Add Worker
                    </button>
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
                </div>
              )}

              {/* Other Work Tab */}
              {activeTab === 'other' && (
                <div className="tab-content">
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
                </div>
              )}

              {/* Quantity & Price Tab */}
              {activeTab === 'quantityprice' && (
                <div className="tab-content">
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
                </div>
              )}
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
