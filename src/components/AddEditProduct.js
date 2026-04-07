import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from './Sidebar.js';
import '../styles.css';
import { storage } from '../utils/storage';
import { productAPI } from '../services/api';
import { measurementsAPI, addonsAPI, staffAPI, workTypeAPI } from '../services/api';
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
  const [workers, setWorkers] = useState([]);
  const [workTypesList, setWorkTypesList] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    outfitTypeId: '',
    subCategoryName: '',
    outfitStyleRefImg: [],
    measurement: [],
    addons: [],
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

  // Fetch initial data
  useEffect(() => {
    fetchOutfitTypes();
    fetchWorkers();
    fetchWorkTypes();
    if (isEditMode && productId) {
      fetchProduct();
    }
  }, [productId]);

  // Fetch addons when outfit type changes
  useEffect(() => {
    if (formData.outfitTypeId) {
      fetchAddons(formData.outfitTypeId);
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
      // Initialize addons from available addons
      const initialAddons = (data || []).map(addon => ({
        title: addon.title,
        fieldType: addon.fieldType,
        options: addon.options || [],
        isSelected: false,
        value: ''
      }));
      setFormData(prev => ({ ...prev, addons: initialAddons }));
    } catch (err) {
      console.error('Error fetching addons:', err);
    }
  };

  const fetchWorkers = async () => {
    try {
      const data = await staffAPI.getStaffList();
      setWorkers(data?.staffList || []);
    } catch (err) {
      console.error('Error fetching workers:', err);
    }
  };

  const fetchWorkTypes = async () => {
    try {
      const data = await workTypeAPI.getWorkTypes();
      setWorkTypesList(data || []);
    } catch (err) {
      console.error('Error fetching work types:', err);
    }
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const data = await productAPI.getProductById(productId);
      if (data) {
        setFormData({
          name: data.name || '',
          outfitTypeId: data.outfitTypeId?._id || data.outfitTypeId || '',
          subCategoryName: data.subCategoryName || '',
          outfitStyleRefImg: data.outfitStyleRefImg || [],
          measurement: data.measurement || [],
          addons: data.addons || [],
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
          assignWorker: data.assignWorker?._id || data.assignWorker || '',
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

  const handleWorkTypeToggle = (workType) => {
    setFormData(prev => ({
      ...prev,
      workTypes: prev.workTypes.includes(workType)
        ? prev.workTypes.filter(w => w !== workType)
        : [...prev.workTypes, workType]
    }));
  };

  const calculateFusingTotal = () => {
    const price = parseFloat(formData.fusingPricePerMeter) || 0;
    const meters = parseFloat(formData.totalFusingMeters) || 0;
    const total = price * meters;
    setFormData(prev => ({ ...prev, totalFusingPrice: total.toFixed(2) }));
  };

  useEffect(() => {
    if (formData.fusingRequired) {
      calculateFusingTotal();
    }
  }, [formData.fusingPricePerMeter, formData.totalFusingMeters]);

  const handleImageUpload = async (field, files) => {
    // Placeholder for image upload - would need uploadAPI
    const imageUrls = Array.from(files).map(file => URL.createObjectURL(file));
    setFormData(prev => ({ ...prev, [field]: [...prev[field], ...imageUrls] }));
  };

  const removeImage = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError('');

      // Filter only selected addons
      const selectedAddons = formData.addons.filter(a => a.isSelected);

      const payload = {
        ...formData,
        addons: selectedAddons,
        quantity: parseInt(formData.quantity) || 0,
        price: parseFloat(formData.price) || 0,
        metersRequired: parseFloat(formData.metersRequired) || 0,
        fusingPricePerMeter: parseFloat(formData.fusingPricePerMeter) || 0,
        totalFusingMeters: parseFloat(formData.totalFusingMeters) || 0,
        totalFusingPrice: parseFloat(formData.totalFusingPrice) || 0
      };

      if (isEditMode) {
        await productAPI.updateProduct({ ...payload, productId });
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

        <form onSubmit={handleSubmit} className="content-section">
          {/* Basic Information */}
          <div style={{ marginBottom: '24px' }}>
            <h3 className="section-title" style={{ marginBottom: '16px' }}>Basic Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div className="form-group">
                <label>Product Name <span style={{ color: 'var(--alert-color)' }}>*</span></label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Outfit Type <span style={{ color: 'var(--alert-color)' }}>*</span></label>
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
                  <label>Subcategory <span style={{ color: 'var(--alert-color)' }}>*</span></label>
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
            <div className="form-group" style={{ marginTop: '16px' }}>
              <label>Outfit Style Reference Images</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                {formData.outfitStyleRefImg.map((img, index) => (
                  <div key={index} style={{ position: 'relative', width: '100px', height: '100px' }}>
                    <img src={img} alt={`Style ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                    <button
                      type="button"
                      onClick={() => removeImage('outfitStyleRefImg', index)}
                      style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--alert-color)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer' }}
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                ))}
                <label style={{ width: '100px', height: '100px', border: '2px dashed var(--border-color)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <FiUpload size={24} color="var(--gray-color)" />
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleImageUpload('outfitStyleRefImg', e.target.files)}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Measurements */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className="section-title">Measurements</h3>
              <button type="button" className="add-btn" onClick={addMeasurement}>
                <FiPlus style={{ marginRight: '6px' }} />
                Add Measurement
              </button>
            </div>
            
            {formData.measurement.map((measure, index) => (
              <div key={index} style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'flex-end' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Field Label</label>
                  <input
                    type="text"
                    className="input-field"
                    value={measure.fieldLable}
                    onChange={(e) => handleMeasurementChange(index, 'fieldLable', e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ width: '120px' }}>
                  <label>Unit</label>
                  <select
                    className="input-field"
                    value={measure.unit}
                    onChange={(e) => handleMeasurementChange(index, 'unit', e.target.value)}
                  >
                    <option value="inch">inch</option>
                    <option value="cm">cm</option>
                    <option value="feet">feet</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Value</label>
                  <input
                    type="text"
                    className="input-field"
                    value={measure.fieldValue}
                    onChange={(e) => handleMeasurementChange(index, 'fieldValue', e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  className="delete-btn"
                  onClick={() => removeMeasurement(index)}
                  style={{ marginBottom: '8px' }}
                >
                  <FiTrash2 />
                </button>
              </div>
            ))}
          </div>

          {/* Addons */}
          {availableAddons.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h3 className="section-title" style={{ marginBottom: '16px' }}>Addons</h3>
              {formData.addons.map((addon, index) => (
                <div key={index} style={{ marginBottom: '16px', padding: '16px', background: 'var(--background-light)', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <input
                      type="checkbox"
                      id={`addon-${index}`}
                      checked={addon.isSelected}
                      onChange={(e) => handleAddonChange(index, 'isSelected', e.target.checked)}
                    />
                    <label htmlFor={`addon-${index}`} style={{ fontWeight: '600', margin: 0 }}>{addon.title}</label>
                    <span style={{ fontSize: '12px', color: 'var(--gray-color)', textTransform: 'capitalize' }}>({addon.fieldType})</span>
                  </div>
                  
                  {addon.isSelected && (
                    <div style={{ marginLeft: '28px' }}>
                      {addon.fieldType === 'text' && (
                        <input
                          type="text"
                          className="input-field"
                          placeholder="Enter value"
                          value={addon.value}
                          onChange={(e) => handleAddonChange(index, 'value', e.target.value)}
                        />
                      )}
                      {(addon.fieldType === 'radio' || addon.fieldType === 'checkbox') && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {addon.options.map((option, optIndex) => (
                            <label key={optIndex} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                              <input
                                type={addon.fieldType === 'radio' ? 'radio' : 'checkbox'}
                                name={`addon-${index}-option`}
                                checked={addon.fieldType === 'radio' ? addon.value === option : addon.value?.includes(option)}
                                onChange={(e) => {
                                  if (addon.fieldType === 'radio') {
                                    handleAddonChange(index, 'value', option);
                                  } else {
                                    const currentValues = addon.value ? addon.value.split(',') : [];
                                    const newValues = e.target.checked
                                      ? [...currentValues, option]
                                      : currentValues.filter(v => v !== option);
                                    handleAddonChange(index, 'value', newValues.join(','));
                                  }
                                }}
                              />
                              {option}
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Fabric Details */}
          <div style={{ marginBottom: '24px' }}>
            <h3 className="section-title" style={{ marginBottom: '16px' }}>Fabric Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div className="form-group">
                <label>Fabric Type</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.fabricType}
                  onChange={(e) => handleInputChange('fabricType', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Fabric Color</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.fabricColor}
                  onChange={(e) => handleInputChange('fabricColor', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Meters Required</label>
                <input
                  type="number"
                  step="0.1"
                  className="input-field"
                  value={formData.metersRequired}
                  onChange={(e) => handleInputChange('metersRequired', e.target.value)}
                />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Fabric Notes</label>
                <textarea
                  className="input-field"
                  rows="3"
                  value={formData.fabricNotes}
                  onChange={(e) => handleInputChange('fabricNotes', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Fusing Details */}
          <div style={{ marginBottom: '24px' }}>
            <h3 className="section-title" style={{ marginBottom: '16px' }}>Fusing Details</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <input
                type="checkbox"
                id="fusingRequired"
                checked={formData.fusingRequired}
                onChange={(e) => handleInputChange('fusingRequired', e.target.checked)}
              />
              <label htmlFor="fusingRequired" style={{ margin: 0 }}>Fusing Required</label>
            </div>
            
            {formData.fusingRequired && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div className="form-group">
                  <label>Fusing Color</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.fusingColor}
                    onChange={(e) => handleInputChange('fusingColor', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Price per Meter</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input-field"
                    value={formData.fusingPricePerMeter}
                    onChange={(e) => handleInputChange('fusingPricePerMeter', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Total Meters</label>
                  <input
                    type="number"
                    step="0.1"
                    className="input-field"
                    value={formData.totalFusingMeters}
                    onChange={(e) => handleInputChange('totalFusingMeters', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Total Fusing Price</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input-field"
                    value={formData.totalFusingPrice}
                    readOnly
                  />
                </div>
              </div>
            )}
          </div>

          {/* Work Types */}
          <div style={{ marginBottom: '24px' }}>
            <h3 className="section-title" style={{ marginBottom: '16px' }}>Work Types</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {workTypesList.map((workType, index) => (
                <label key={index} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  padding: '8px 16px', 
                  background: formData.workTypes.includes(workType) ? 'var(--primary-color)' : 'var(--background-light)',
                  color: formData.workTypes.includes(workType) ? 'white' : 'var(--text-color)',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  border: '1px solid var(--border-color)'
                }}>
                  <input
                    type="checkbox"
                    checked={formData.workTypes.includes(workType)}
                    onChange={() => handleWorkTypeToggle(workType)}
                    style={{ display: 'none' }}
                  />
                  {workType}
                </label>
              ))}
            </div>
            
            <div className="form-group" style={{ marginTop: '16px' }}>
              <label>Embroidery Work Notes</label>
              <textarea
                className="input-field"
                rows="3"
                value={formData.embroideryWorkNotes}
                onChange={(e) => handleInputChange('embroideryWorkNotes', e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginTop: '16px' }}>
              <label>Embroidery Reference Images</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                {formData.embroideryRefImg.map((img, index) => (
                  <div key={index} style={{ position: 'relative', width: '100px', height: '100px' }}>
                    <img src={img} alt={`Embroidery ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                    <button
                      type="button"
                      onClick={() => removeImage('embroideryRefImg', index)}
                      style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--alert-color)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer' }}
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                ))}
                <label style={{ width: '100px', height: '100px', border: '2px dashed var(--border-color)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <FiUpload size={24} color="var(--gray-color)" />
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleImageUpload('embroideryRefImg', e.target.files)}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Stitching Details */}
          <div style={{ marginBottom: '24px' }}>
            <h3 className="section-title" style={{ marginBottom: '16px' }}>Stitching Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div className="form-group">
                <label>Assign Worker</label>
                <select
                  className="input-field"
                  value={formData.assignWorker}
                  onChange={(e) => handleInputChange('assignWorker', e.target.value)}
                >
                  <option value="">Select Worker</option>
                  {workers.map(worker => (
                    <option key={worker._id} value={worker._id}>{worker.name || worker.fullName}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Stitching Style</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.stitichingStyle}
                  onChange={(e) => handleInputChange('stitichingStyle', e.target.value)}
                />
              </div>
            </div>
            <div className="form-group" style={{ marginTop: '16px' }}>
              <label>Stitching Notes</label>
              <textarea
                className="input-field"
                rows="3"
                value={formData.stitichingNotes}
                onChange={(e) => handleInputChange('stitichingNotes', e.target.value)}
              />
            </div>
            <div className="form-group" style={{ marginTop: '16px' }}>
              <label>Stitching Reference Images</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                {formData.stitichingRefImg.map((img, index) => (
                  <div key={index} style={{ position: 'relative', width: '100px', height: '100px' }}>
                    <img src={img} alt={`Stitching ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                    <button
                      type="button"
                      onClick={() => removeImage('stitichingRefImg', index)}
                      style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--alert-color)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer' }}
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                ))}
                <label style={{ width: '100px', height: '100px', border: '2px dashed var(--border-color)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <FiUpload size={24} color="var(--gray-color)" />
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleImageUpload('stitichingRefImg', e.target.files)}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Other Work */}
          <div style={{ marginBottom: '24px' }}>
            <h3 className="section-title" style={{ marginBottom: '16px' }}>Other Work</h3>
            <div className="form-group">
              <label>Other Work Description</label>
              <textarea
                className="input-field"
                rows="3"
                value={formData.otherWork}
                onChange={(e) => handleInputChange('otherWork', e.target.value)}
              />
            </div>
            <div className="form-group" style={{ marginTop: '16px' }}>
              <label>Other Work Reference Images</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                {formData.otherWorkRefImg.map((img, index) => (
                  <div key={index} style={{ position: 'relative', width: '100px', height: '100px' }}>
                    <img src={img} alt={`Other Work ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                    <button
                      type="button"
                      onClick={() => removeImage('otherWorkRefImg', index)}
                      style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--alert-color)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer' }}
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                ))}
                <label style={{ width: '100px', height: '100px', border: '2px dashed var(--border-color)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <FiUpload size={24} color="var(--gray-color)" />
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleImageUpload('otherWorkRefImg', e.target.files)}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Quantity and Price */}
          <div style={{ marginBottom: '24px' }}>
            <h3 className="section-title" style={{ marginBottom: '16px' }}>Quantity & Price</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div className="form-group">
                <label>Quantity <span style={{ color: 'var(--alert-color)' }}>*</span></label>
                <input
                  type="number"
                  className="input-field"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Price <span style={{ color: 'var(--alert-color)' }}>*</span></label>
                <input
                  type="number"
                  step="0.01"
                  className="input-field"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
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
