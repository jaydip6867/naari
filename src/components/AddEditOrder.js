import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from './Sidebar.js';
import '../styles.css';
import { storage } from '../utils/storage';
import { orderAPI, productAPI, measurementsAPI, addonsAPI, customerAPI, uploadAPI, staffAPI } from '../services/api';
import { FiPlus, FiTrash2, FiUpload, FiX, FiArrowLeft } from 'react-icons/fi';

const AddEditOrder = ({ onLogout }) => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const isEditMode = Boolean(orderId);

  const [formData, setFormData] = useState({
    customerId: '',
    orderType: 'product',
    productId: '',
    outfitTypeId: '',
    subCategoryName: '',
    outfitStyleRefImg: [],
    measurement: [],
    addons: [],
    // Update Order fields
    fabricType: '',
    fabricColor: '',
    metersRequired: '',
    fabricNotes: '',
    fusingRequired: false,
    fusingColor: '',
    fusingDays: '',
    fusingPrice: '',
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
    // Timeline and Pricing
    fabricPurchaseDays: '',
    fabricPurchasePrice: '',
    dyeingDays: '',
    dyeingPrice: '',
    embroideryDays: '',
    embroideryPrice: '',
    stitichingDays: '',
    stitichingPrice: '',
    otherWorkDays: '',
    otherWorkPrice: '',
    packingDays: '',
    packingPrice: '',
    totalDays: '',
    totalPrice: '',
    advanceAmount: '',
    deliveryDate: '',
    specialInstructions: ''
  });

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [outfitTypes, setOutfitTypes] = useState([]);
  const [availableAddons, setAvailableAddons] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedOutfit, setSelectedOutfit] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const [pendingUploads, setPendingUploads] = useState([]); // Track files needing upload
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, [orderId]);

  const loadInitialData = async () => {
    setInitialLoading(true);
    try {
      await Promise.all([
        fetchCustomers(),
        fetchProducts(),
        fetchOutfitTypes(),
        fetchStaff(),
        isEditMode ? fetchOrder() : Promise.resolve()
      ]);
    } catch (err) {
      console.error('Error loading initial data:', err);
      setError('Failed to load data. Please refresh the page.');
    } finally {
      setInitialLoading(false);
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

  useEffect(() => {
    if (formData.outfitTypeId && formData.orderType === 'customized') {
      const outfit = outfitTypes.find(o => o._id === formData.outfitTypeId);
      setSelectedOutfit(outfit || null);
      fetchAddons(formData.outfitTypeId);
      populateMeasurementsFromOutfitType(formData.outfitTypeId, formData.subCategoryName);
    } else {
      setSelectedOutfit(null);
    }
  }, [formData.outfitTypeId, formData.orderType, outfitTypes]);

  // Re-fetch measurements when subcategory changes
  useEffect(() => {
    if (formData.outfitTypeId && formData.orderType === 'customized' && formData.subCategoryName) {
      populateMeasurementsFromOutfitType(formData.outfitTypeId, formData.subCategoryName);
    }
  }, [formData.subCategoryName, formData.outfitTypeId, formData.orderType]);

  useEffect(() => {
    if (formData.productId) {
      fetchProductDetails(formData.productId);
    }
  }, [formData.productId]);

  const fetchProductDetails = async (productId) => {
    try {
      const product = await productAPI.getProductById(productId);
      if (product) {
        setSelectedProduct(product);
        setFormData(prev => ({
          ...prev,
          outfitTypeId: product.outfitTypeId?._id || product.outfitTypeId || '',
          subCategoryName: product.subCategoryName || '',
          measurement: product.measurement || [],
          addons: product.addons || []
        }));
      }
    } catch (err) {
      console.error('Error fetching product details:', err);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await customerAPI.getCustomers();
      setCustomers(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error('Error fetching customers:', err);
      throw err;
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await productAPI.getProducts();
      setProducts(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error('Error fetching products:', err);
      throw err;
    }
  };

  const fetchOutfitTypes = async () => {
    try {
      const response = await measurementsAPI.getOutfitTypes();
      setOutfitTypes(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error('Error fetching outfit types:', err);
      throw err;
    }
  };

  const fetchAddons = async (outfitTypeId) => {
    try {
      const response = await addonsAPI.getAddons('', outfitTypeId);
      const addons = Array.isArray(response) ? response : [];
      setAvailableAddons(addons);
      
      setFormData(prev => {
        const existingAddons = prev.addons || [];
        const mergedAddons = addons.map(addon => {
          const existing = existingAddons.find(a => a.title === addon.title || a._id === addon._id);
          return existing ? { ...addon, ...existing } : { ...addon, isSelected: false, value: '' };
        });
        return { ...prev, addons: mergedAddons };
      });
    } catch (err) {
      console.error('Error fetching addons:', err);
    }
  };

  const fetchOrder = async () => {
    try {
      const response = await orderAPI.getOrderById(orderId);
      if (response) {
        const order = response;
        setFormData({
          customerId: order.customerId?._id || order.customerId || '',
          orderType: order.orderType || 'product',
          productId: order.productId?._id || order.productId || '',
          outfitTypeId: order.outfitTypeId?._id || order.outfitTypeId || '',
          subCategoryName: order.subCategoryName || '',
          outfitStyleRefImg: order.outfitStyleRefImg || [],
          measurement: order.measurement || [],
          addons: order.addons || [],
          fabricType: order.fabricType || '',
          fabricColor: order.fabricColor || '',
          metersRequired: order.metersRequired || '',
          fabricNotes: order.fabricNotes || '',
          fusingRequired: order.fusingRequired || false,
          fusingColor: order.fusingColor || '',
          fusingDays: order.fusingDays || '',
          fusingPrice: order.fusingPrice || '',
          workTypes: order.workTypes || [],
          fabricRefImg: order.fabricRefImg || [],
          workTypeRefImg: order.workTypeRefImg || [],
          embroideryWorkNotes: order.embroideryWorkNotes || '',
          embroideryRefImg: order.embroideryRefImg || [],
          assignWorker: Array.isArray(order.assignWorker)
            ? order.assignWorker.map(w => {
                const workerId = w.workerId?._id || w.workerId || '';
                return { workerId, status: w.status || 'order_overview' };
              })
            : [],
          stitichingStyle: order.stitichingStyle || '',
          stitichingNotes: order.stitichingNotes || '',
          stitichingRefImg: order.stitichingRefImg || [],
          otherWork: order.otherWork || '',
          otherWorkRefImg: order.otherWorkRefImg || [],
          fabricPurchaseDays: order.fabricPurchaseDays || '',
          fabricPurchasePrice: order.fabricPurchasePrice || '',
          dyeingDays: order.dyeingDays || '',
          dyeingPrice: order.dyeingPrice || '',
          embroideryDays: order.embroideryDays || '',
          embroideryPrice: order.embroideryPrice || '',
          stitichingDays: order.stitichingDays || '',
          stitichingPrice: order.stitichingPrice || '',
          otherWorkDays: order.otherWorkDays || '',
          otherWorkPrice: order.otherWorkPrice || '',
          packingDays: order.packingDays || '',
          packingPrice: order.packingPrice || '',
          totalDays: order.totalDays || '',
          totalPrice: order.totalPrice || '',
          advanceAmount: order.advanceAmount || '',
          deliveryDate: order.deliveryDate || '',
          specialInstructions: order.specialInstructions || ''
        });
      }
    } catch (err) {
      console.error('Error fetching order:', err);
      setError(err.message || 'Failed to fetch order');
      throw err;
    }
  };

  const populateMeasurementsFromOutfitType = async (outfitTypeId, subCategoryName = null) => {
    try {
      const outfitTypesList = await measurementsAPI.getOutfitTypes();
      const outfit = outfitTypesList.find(o => o._id === outfitTypeId);

      let fields = [];

      if (outfit) {
        // If has subcategories and subcategory is selected, get fields from subcategory
        if (outfit.hasSubCategories && subCategoryName && outfit.subCategories) {
          const subCategory = outfit.subCategories.find(s => s.name === subCategoryName);
          if (subCategory && subCategory.fields) {
            fields = subCategory.fields;
          }
        }
        // Otherwise get fields from main outfit type
        else if (outfit.fields && outfit.fields.length > 0) {
          fields = outfit.fields;
        }
      }

      if (fields.length > 0) {
        const measurements = fields.map(f => ({
          fieldLable: f.label || '',
          unit: f.unit || 'inch',
          fieldValue: ''
        }));
        setFormData(prev => ({ ...prev, measurement: measurements }));
      } else {
        setFormData(prev => ({ ...prev, measurement: [] }));
      }
    } catch (err) {
      console.error('Error fetching outfit type measurements:', err);
      setFormData(prev => ({ ...prev, measurement: [] }));
    }
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

  // Auto-calculate total days and total price
  useEffect(() => {
    const fabricPurchaseDays = parseInt(formData.fabricPurchaseDays) || 0;
    const dyeingDays = parseInt(formData.dyeingDays) || 0;
    const embroideryDays = parseInt(formData.embroideryDays) || 0;
    const stitichingDays = parseInt(formData.stitichingDays) || 0;
    const otherWorkDays = parseInt(formData.otherWorkDays) || 0;
    const packingDays = parseInt(formData.packingDays) || 0;
    const fusingDays = parseInt(formData.fusingDays) || 0;

    const fabricPurchasePrice = parseFloat(formData.fabricPurchasePrice) || 0;
    const dyeingPrice = parseFloat(formData.dyeingPrice) || 0;
    const embroideryPrice = parseFloat(formData.embroideryPrice) || 0;
    const stitichingPrice = parseFloat(formData.stitichingPrice) || 0;
    const otherWorkPrice = parseFloat(formData.otherWorkPrice) || 0;
    const packingPrice = parseFloat(formData.packingPrice) || 0;
    const fusingPrice = parseFloat(formData.fusingPrice) || 0;

    const totalDays = fabricPurchaseDays + dyeingDays + embroideryDays + stitichingDays + otherWorkDays + packingDays + fusingDays;
    const totalPrice = fabricPurchasePrice + dyeingPrice + embroideryPrice + stitichingPrice + otherWorkPrice + packingPrice + fusingPrice;

    setFormData(prev => ({
      ...prev,
      totalDays: totalDays.toString(),
      totalPrice: totalPrice.toFixed(2)
    }));
  }, [
    formData.fabricPurchaseDays,
    formData.dyeingDays,
    formData.embroideryDays,
    formData.stitichingDays,
    formData.otherWorkDays,
    formData.packingDays,
    formData.fusingDays,
    formData.fabricPurchasePrice,
    formData.dyeingPrice,
    formData.embroideryPrice,
    formData.stitichingPrice,
    formData.otherWorkPrice,
    formData.packingPrice,
    formData.fusingPrice
  ]);

  // Auto-calculate delivery date: today + totalDays
  useEffect(() => {
    const totalDays = parseInt(formData.totalDays) || 0;
    if (totalDays > 0) {
      const today = new Date();
      const deliveryDate = new Date(today);
      deliveryDate.setDate(today.getDate() + totalDays);
      
      // Format as YYYY-MM-DD for date input
      const year = deliveryDate.getFullYear();
      const month = String(deliveryDate.getMonth() + 1).padStart(2, '0');
      const day = String(deliveryDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      
      setFormData(prev => ({
        ...prev,
        deliveryDate: formattedDate
      }));
    }
  }, [formData.totalDays]);

  const handleMeasurementChange = (index, field, value) => {
    setFormData(prev => {
      const updated = [...prev.measurement];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, measurement: updated };
    });
  };

  const handleAddonChange = (index, field, value) => {
    setFormData(prev => {
      const updated = [...prev.addons];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, addons: updated };
    });
  };

  const handleImageUpload = async (field, files) => {
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);
    const newPreviews = newFiles.map(file => ({
      url: URL.createObjectURL(file),
      file: file,
      isNew: true
    }));

    setPendingUploads(prev => [...prev, ...newFiles]);
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], ...newPreviews.map(p => p.url)]
    }));
  };

  const removeImage = (field, index) => {
    setFormData(prev => {
      const updated = [...prev[field]];
      const removedUrl = updated[index];
      updated.splice(index, 1);

      // Also remove from pending uploads if it was a new file
      if (removedUrl && removedUrl.startsWith('blob:')) {
        setPendingUploads(prev => prev.filter(f => {
          const blobUrl = URL.createObjectURL(f);
          const shouldRemove = blobUrl === removedUrl;
          URL.revokeObjectURL(blobUrl);
          return !shouldRemove;
        }));
      }

      return { ...prev, [field]: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      // Separate existing URLs from new blob URLs for each image field
      const existingUrls = formData.outfitStyleRefImg.filter(img => !img.startsWith('blob:'));
      const existingFabricUrls = formData.fabricRefImg.filter(img => !img.startsWith('blob:'));
      const existingWorkTypeUrls = formData.workTypeRefImg.filter(img => !img.startsWith('blob:'));

      let uploadedImageUrls = [...existingUrls];

      // Upload new images if any
      if (pendingUploads.length > 0) {
        const uploadResponse = await uploadAPI.uploadMultipleImages(pendingUploads);
        const newUrls = Array.isArray(uploadResponse) ? uploadResponse :
                       uploadResponse?.Data || uploadResponse?.urls || [];
        uploadedImageUrls = [...uploadedImageUrls, ...newUrls];
      }

      // Clean up pending uploads
      setPendingUploads([]);

      // Build final URLs for each image field (existing + newly uploaded)
      const finalFabricUrls = [...existingFabricUrls, ...uploadedImageUrls.filter(url => !existingUrls.includes(url))];
      const finalWorkTypeUrls = [...existingWorkTypeUrls, ...uploadedImageUrls.filter(url => !existingUrls.includes(url) && !finalFabricUrls.includes(url))];

      const payload = {
        customerId: formData.customerId,
        orderType: formData.orderType,
        productId: formData.orderType === 'product' ? formData.productId : '',
        outfitTypeId: formData.orderType === 'customized' ? formData.outfitTypeId : '',
        subCategoryName: formData.subCategoryName,
        outfitStyleRefImg: uploadedImageUrls,
        measurement: formData.measurement.map(m => ({
          fieldLable: m.fieldLable,
          unit: m.unit,
          fieldValue: parseFloat(m.fieldValue) || 0
        })),
        addons: formData.addons.map(a => ({
          title: a.title,
          fieldType: a.fieldType,
          options: a.options,
          isSelected: a.isSelected,
          value: a.value
        }))
      };

      if (isEditMode) {
        payload.orderId = orderId;
        payload.fabricType = formData.fabricType;
        payload.fabricColor = formData.fabricColor;
        payload.metersRequired = parseFloat(formData.metersRequired) || 0;
        payload.fabricNotes = formData.fabricNotes;
        payload.fusingRequired = formData.fusingRequired;
        payload.fusingColor = formData.fusingColor;
        payload.fusingDays = parseInt(formData.fusingDays) || 0;
        payload.fusingPrice = parseFloat(formData.fusingPrice) || 0;
        payload.workTypes = formData.workTypes;
        payload.fabricRefImg = finalFabricUrls;
        payload.workTypeRefImg = finalWorkTypeUrls;
        payload.embroideryWorkNotes = formData.embroideryWorkNotes;
        payload.embroideryRefImg = formData.embroideryRefImg;
        payload.assignWorker = formData.assignWorker;
        payload.stitichingStyle = formData.stitichingStyle;
        payload.stitichingNotes = formData.stitichingNotes;
        payload.stitichingRefImg = formData.stitichingRefImg;
        payload.otherWork = formData.otherWork;
        payload.otherWorkRefImg = formData.otherWorkRefImg;
        payload.fabricPurchaseDays = parseInt(formData.fabricPurchaseDays) || 0;
        payload.fabricPurchasePrice = parseFloat(formData.fabricPurchasePrice) || 0;
        payload.dyeingDays = parseInt(formData.dyeingDays) || 0;
        payload.dyeingPrice = parseFloat(formData.dyeingPrice) || 0;
        payload.embroideryDays = parseInt(formData.embroideryDays) || 0;
        payload.embroideryPrice = parseFloat(formData.embroideryPrice) || 0;
        payload.stitichingDays = parseInt(formData.stitichingDays) || 0;
        payload.stitichingPrice = parseFloat(formData.stitichingPrice) || 0;
        payload.otherWorkDays = parseInt(formData.otherWorkDays) || 0;
        payload.otherWorkPrice = parseFloat(formData.otherWorkPrice) || 0;
        payload.packingDays = parseInt(formData.packingDays) || 0;
        payload.packingPrice = parseFloat(formData.packingPrice) || 0;
        payload.totalDays = parseInt(formData.totalDays) || 0;
        payload.totalPrice = parseFloat(formData.totalPrice) || 0;
        payload.advanceAmount = parseFloat(formData.advanceAmount) || 0;
        payload.deliveryDate = formData.deliveryDate;
        payload.specialInstructions = formData.specialInstructions;

        await orderAPI.updateOrder(payload);
        navigate('/orders');
      } else {
        const newOrder = await orderAPI.createOrder(payload);
        navigate(`/orders/edit/${newOrder._id}`);
      }
    } catch (err) {
      console.error('Error saving order:', err);
      setError(err.message || 'Failed to save order');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    storage.clearAuthData();
    onLogout();
    navigate('/');
  };

  if (initialLoading) {
    return (
      <div className="settings-container">
        <Sidebar onLogout={handleLogout} />
        <div className="main-content">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <div className="loading">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-container">
      <Sidebar onLogout={handleLogout} />

      <div className="main-content">
        <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/orders')}
            style={{ padding: '8px 12px' }}
          >
            <FiArrowLeft />
          </button>
          <h1 className="page-title">{isEditMode ? 'Edit Order' : 'Add New Order'}</h1>
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
                <label className="form-label">Customer <span className="required">*</span></label>
                <select
                  className="input-field"
                  value={formData.customerId}
                  onChange={(e) => handleInputChange('customerId', e.target.value)}
                  required
                  style={{ maxWidth: '100%', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}
                >
                  <option value="">Select Customer</option>
                  {customers.map(customer => (
                    <option key={customer._id} value={customer._id} style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {customer.fullName.length > 30 ? customer.fullName.substring(0, 30) + '...' : customer.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Order Type <span className="required">*</span></label>
                <select
                  className="input-field"
                  value={formData.orderType}
                  onChange={(e) => handleInputChange('orderType', e.target.value)}
                  required
                >
                  <option value="product">Product</option>
                  <option value="customized">Customized</option>
                </select>
              </div>

              {formData.orderType === 'product' && (
                <div className="form-group">
                  <label className="form-label">Product <span className="required">*</span></label>
                  <select
                    className="input-field"
                    value={formData.productId}
                    onChange={(e) => handleInputChange('productId', e.target.value)}
                    required={formData.orderType === 'product'}
                    style={{ maxWidth: '100%', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}
                  >
                    <option value="">Select Product</option>
                    {products.map(product => (
                      <option key={product._id} value={product._id} style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {product.name.length > 30 ? product.name.substring(0, 30) + '...' : product.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {formData.orderType === 'customized' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Outfit Type <span className="required">*</span></label>
                    <select
                      className="input-field"
                      value={formData.outfitTypeId}
                      onChange={(e) => handleInputChange('outfitTypeId', e.target.value)}
                      required={formData.orderType === 'customized'}
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
                </>
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

          {/* Measurements */}
          {(formData.orderType === 'customized' || formData.orderType === 'product') && (
            <div className="form-section">
              <h3 className="section-title form-section-title">Measurements</h3>
              {formData.measurement.length > 0 ? (
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
                          className={`input-field ${formData.orderType === 'product' ? 'input-disabled' : ''}`}
                          value={measure.fieldValue}
                          onChange={(e) => handleMeasurementChange(index, 'fieldValue', e.target.value)}
                          placeholder="Enter value"
                          disabled={formData.orderType === 'product'}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--gray-color)', fontStyle: 'italic' }}>
                  {formData.orderType === 'product'
                    ? (formData.productId ? 'No measurements available for this product.' : 'Select a product to see measurements.')
                    : (formData.outfitTypeId ? 'No measurements available for this outfit type.' : 'Select an outfit type to see measurements.')
                  }
                </p>
              )}
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
                        disabled={formData.orderType === 'product'}
                      />
                      <label htmlFor={`addon-${index}`} className="addon-title">{addon.title}</label>
                      <span className="addon-type">({addon.fieldType})</span>
                    </div>
                    
                    {addon.isSelected && (
                      <div className="addon-content">
                        {addon.fieldType === 'text' && (
                          <input
                            type="text"
                            className={`input-field ${formData.orderType === 'product' ? 'input-disabled' : ''}`}
                            placeholder="Enter value"
                            value={addon.value}
                            onChange={(e) => handleAddonChange(index, 'value', e.target.value)}
                            disabled={formData.orderType === 'product'}
                          />
                        )}
                        {addon.fieldType === 'radio' && (
                          <div className="radio-group">
                            {addon.options.map((option, optIndex) => (
                              <label key={optIndex} className={`radio-label ${formData.orderType === 'product' ? 'disabled' : ''}`}>
                                <input
                                  type="radio"
                                  name={`addon-${index}-option`}
                                  checked={addon.value === option}
                                  onChange={() => handleAddonChange(index, 'value', option)}
                                  disabled={formData.orderType === 'product'}
                                />
                                <span>{option}</span>
                              </label>
                            ))}
                          </div>
                        )}
                        {addon.fieldType === 'checkbox' && (
                          <div className="checkbox-group">
                            {addon.options.map((option, optIndex) => (
                              <label key={optIndex} className={`checkbox-label ${formData.orderType === 'product' ? 'disabled' : ''}`}>
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
                                  disabled={formData.orderType === 'product'}
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

          {/* Update Order Additional Fields - Only in Edit Mode */}
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
                      className={`input-field ${formData.orderType === 'product' ? 'input-disabled' : ''}`}
                      value={formData.fabricType}
                      onChange={(e) => handleInputChange('fabricType', e.target.value)}
                      placeholder="e.g., Cotton"
                      disabled={formData.orderType === 'product'}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Fabric Color</label>
                    <input
                      type="text"
                      className={`input-field ${formData.orderType === 'product' ? 'input-disabled' : ''}`}
                      value={formData.fabricColor}
                      onChange={(e) => handleInputChange('fabricColor', e.target.value)}
                      placeholder="e.g., Maroon"
                      disabled={formData.orderType === 'product'}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Meters Required</label>
                    <input
                      type="number"
                      step="0.1"
                      className={`input-field ${formData.orderType === 'product' ? 'input-disabled' : ''}`}
                      value={formData.metersRequired}
                      onChange={(e) => handleInputChange('metersRequired', e.target.value)}
                      placeholder="e.g., 3.5"
                      disabled={formData.orderType === 'product'}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label className="form-label">Fabric Notes</label>
                    <textarea
                      className={`input-field ${formData.orderType === 'product' ? 'input-disabled' : ''}`}
                      rows="2"
                      value={formData.fabricNotes}
                      onChange={(e) => handleInputChange('fabricNotes', e.target.value)}
                      placeholder="Enter fabric notes..."
                      disabled={formData.orderType === 'product'}
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
                            style={{ opacity: formData.orderType === 'product' ? 0.5 : 1 }}
                            disabled={formData.orderType === 'product'}
                          >
                            <FiX size={14} />
                          </button>
                        </div>
                      ))}
                      <label className={`image-upload-btn ${formData.orderType === 'product' ? 'disabled' : ''}`} style={{ opacity: formData.orderType === 'product' ? 0.5 : 1 }}>
                        <FiUpload size={24} />
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => handleImageUpload('fabricRefImg', e.target.files)}
                          disabled={formData.orderType === 'product'}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fusing Details */}
              <div className="form-section">
                <h3 className="section-title form-section-title">Fusing Details</h3>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className={`checkbox-label ${formData.orderType === 'product' ? 'disabled' : ''}`}>
                    <input
                      type="checkbox"
                      checked={formData.fusingRequired}
                      onChange={(e) => handleInputChange('fusingRequired', e.target.checked)}
                      disabled={formData.orderType === 'product'}
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
                        className={`input-field ${formData.orderType === 'product' ? 'input-disabled' : ''}`}
                        value={formData.fusingColor}
                        onChange={(e) => handleInputChange('fusingColor', e.target.value)}
                        placeholder="e.g., Black"
                        disabled={formData.orderType === 'product'}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Fusing Days</label>
                      <input
                        type="number"
                        className={`input-field ${formData.orderType === 'product' ? 'input-disabled' : ''}`}
                        value={formData.fusingDays}
                        onChange={(e) => handleInputChange('fusingDays', e.target.value)}
                        placeholder="e.g., 2"
                        disabled={formData.orderType === 'product'}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Fusing Price</label>
                      <input
                        type="number"
                        step="0.1"
                        className={`input-field ${formData.orderType === 'product' ? 'input-disabled' : ''}`}
                        value={formData.fusingPrice}
                        onChange={(e) => handleInputChange('fusingPrice', e.target.value)}
                        placeholder="e.g., 50"
                        disabled={formData.orderType === 'product'}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Work Types */}
              <div className="form-section">
                <h3 className="section-title form-section-title">Work Types</h3>
                <div className="form-group full-width">
                  <label className="form-label">Work Types</label>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    <input
                      type="text"
                      className={`input-field ${formData.orderType === 'product' ? 'input-disabled' : ''}`}
                      id="workTypeInput"
                      placeholder="e.g., HANDWORK"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addWorkType(e.target.value.trim());
                          e.target.value = '';
                        }
                      }}
                      disabled={formData.orderType === 'product'}
                    />
                    <button
                      type="button"
                      className="add-btn"
                      onClick={() => {
                        const input = document.getElementById('workTypeInput');
                        addWorkType(input.value.trim());
                        input.value = '';
                      }}
                      disabled={formData.orderType === 'product'}
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
                            cursor: formData.orderType === 'product' ? 'not-allowed' : 'pointer',
                            padding: '2px',
                            display: 'flex',
                            alignItems: 'center',
                            color: 'var(--primary-color)',
                            opacity: formData.orderType === 'product' ? 0.5 : 1
                          }}
                          disabled={formData.orderType === 'product'}
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
                            style={{ opacity: formData.orderType === 'product' ? 0.5 : 1 }}
                            disabled={formData.orderType === 'product'}
                          >
                            <FiX size={14} />
                          </button>
                        </div>
                      ))}
                      <label className={`image-upload-btn ${formData.orderType === 'product' ? 'disabled' : ''}`} style={{ opacity: formData.orderType === 'product' ? 0.5 : 1 }}>
                        <FiUpload size={24} />
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => handleImageUpload('workTypeRefImg', e.target.files)}
                          disabled={formData.orderType === 'product'}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Embroidery & Stitching */}
              <div className="form-section">
                <h3 className="section-title form-section-title">Embroidery & Stitching</h3>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label className="form-label">Embroidery Work Notes</label>
                    <textarea
                      className={`input-field ${formData.orderType === 'product' ? 'input-disabled' : ''}`}
                      rows="2"
                      value={formData.embroideryWorkNotes}
                      onChange={(e) => handleInputChange('embroideryWorkNotes', e.target.value)}
                      placeholder="Enter embroidery notes..."
                      disabled={formData.orderType === 'product'}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label className="form-label">Assign Workers</label>
                    {formData.assignWorker.map((assignment, index) => (
                      <div key={index} className="worker-assignment-row" style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                        <select
                          className={`input-field ${formData.orderType === 'product' ? 'input-disabled' : ''}`}
                          style={{ flex: 1 }}
                          value={assignment.workerId}
                          onChange={(e) => handleWorkerAssignmentChange(index, 'workerId', e.target.value)}
                          disabled={formData.orderType === 'product'}
                        >
                          <option value="">Select Worker</option>
                          {staffList.map((staff) => (
                            <option key={staff._id} value={staff._id}>
                              {staff.fullName}
                            </option>
                          ))}
                        </select>
                        <select
                          className={`input-field ${formData.orderType === 'product' ? 'input-disabled' : ''}`}
                          style={{ flex: 1 }}
                          value={assignment.status}
                          onChange={(e) => handleWorkerAssignmentChange(index, 'status', e.target.value)}
                          disabled={formData.orderType === 'product'}
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
                          style={{ padding: '8px', opacity: formData.orderType === 'product' ? 0.5 : 1 }}
                          disabled={formData.orderType === 'product'}
                        >
                          <FiTrash2 size={16} className='delete-icon' />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="add-btn"
                      onClick={addWorkerAssignment}
                      style={{ marginTop: '8px', justifyContent: 'center', opacity: formData.orderType === 'product' ? 0.5 : 1 }}
                      disabled={formData.orderType === 'product'}
                    >
                      <FiPlus size={16} /> Add Worker
                    </button>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Stitching Style</label>
                    <input
                      type="text"
                      className={`input-field ${formData.orderType === 'product' ? 'input-disabled' : ''}`}
                      value={formData.stitichingStyle}
                      onChange={(e) => handleInputChange('stitichingStyle', e.target.value)}
                      placeholder="e.g., Regular"
                      disabled={formData.orderType === 'product'}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label className="form-label">Stitching Notes</label>
                    <textarea
                      className={`input-field ${formData.orderType === 'product' ? 'input-disabled' : ''}`}
                      rows="2"
                      value={formData.stitichingNotes}
                      onChange={(e) => handleInputChange('stitichingNotes', e.target.value)}
                      placeholder="Enter stitching notes..."
                      disabled={formData.orderType === 'product'}
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
                    className={`input-field ${formData.orderType === 'product' ? 'input-disabled' : ''}`}
                    rows="2"
                    value={formData.otherWork}
                    onChange={(e) => handleInputChange('otherWork', e.target.value)}
                    placeholder="Enter other work details..."
                    disabled={formData.orderType === 'product'}
                  />
                </div>
              </div>

              {/* Timeline & Pricing */}
              <div className="form-section">
                <h3 className="section-title form-section-title">Timeline & Pricing</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Fabric Purchase Days</label>
                    <input
                      type="number"
                      className="input-field"
                      value={formData.fabricPurchaseDays}
                      onChange={(e) => handleInputChange('fabricPurchaseDays', e.target.value)}
                      placeholder="Days"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Fabric Purchase Price</label>
                    <input
                      type="number"
                      step="0.01"
                      className="input-field"
                      value={formData.fabricPurchasePrice}
                      onChange={(e) => handleInputChange('fabricPurchasePrice', e.target.value)}
                      placeholder="Price"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Dyeing Days</label>
                    <input
                      type="number"
                      className="input-field"
                      value={formData.dyeingDays}
                      onChange={(e) => handleInputChange('dyeingDays', e.target.value)}
                      placeholder="Days"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Dyeing Price</label>
                    <input
                      type="number"
                      step="0.01"
                      className="input-field"
                      value={formData.dyeingPrice}
                      onChange={(e) => handleInputChange('dyeingPrice', e.target.value)}
                      placeholder="Price"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Embroidery Days</label>
                    <input
                      type="number"
                      className="input-field"
                      value={formData.embroideryDays}
                      onChange={(e) => handleInputChange('embroideryDays', e.target.value)}
                      placeholder="Days"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Embroidery Price</label>
                    <input
                      type="number"
                      step="0.01"
                      className="input-field"
                      value={formData.embroideryPrice}
                      onChange={(e) => handleInputChange('embroideryPrice', e.target.value)}
                      placeholder="Price"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Stitching Days</label>
                    <input
                      type="number"
                      className="input-field"
                      value={formData.stitichingDays}
                      onChange={(e) => handleInputChange('stitichingDays', e.target.value)}
                      placeholder="Days"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Stitching Price</label>
                    <input
                      type="number"
                      step="0.01"
                      className="input-field"
                      value={formData.stitichingPrice}
                      onChange={(e) => handleInputChange('stitichingPrice', e.target.value)}
                      placeholder="Price"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Other Work Days</label>
                    <input
                      type="number"
                      className="input-field"
                      value={formData.otherWorkDays}
                      onChange={(e) => handleInputChange('otherWorkDays', e.target.value)}
                      placeholder="Days"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Other Work Price</label>
                    <input
                      type="number"
                      step="0.01"
                      className="input-field"
                      value={formData.otherWorkPrice}
                      onChange={(e) => handleInputChange('otherWorkPrice', e.target.value)}
                      placeholder="Price"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Packing Days</label>
                    <input
                      type="number"
                      className="input-field"
                      value={formData.packingDays}
                      onChange={(e) => handleInputChange('packingDays', e.target.value)}
                      placeholder="Days"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Packing Price</label>
                    <input
                      type="number"
                      step="0.01"
                      className="input-field"
                      value={formData.packingPrice}
                      onChange={(e) => handleInputChange('packingPrice', e.target.value)}
                      placeholder="Price"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Total Days (Auto-calculated)</label>
                    <input
                      type="number"
                      className="input-field input-disabled"
                      value={formData.totalDays}
                      disabled
                      placeholder="Auto-calculated"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Total Price (₹) (Auto-calculated)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="input-field input-disabled"
                      value={formData.totalPrice}
                      disabled
                      placeholder="Auto-calculated"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Advance Amount (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="input-field"
                      value={formData.advanceAmount}
                      onChange={(e) => handleInputChange('advanceAmount', e.target.value)}
                      placeholder="Advance Amount"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Delivery Date (Auto-calculated)</label>
                    <input
                      type="date"
                      className="input-field"
                      value={formData.deliveryDate}
                      onChange={(e) => handleInputChange('deliveryDate', e.target.value)}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label className="form-label">Special Instructions</label>
                    <textarea
                      className="input-field"
                      rows="2"
                      value={formData.specialInstructions}
                      onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                      placeholder="Enter special instructions..."
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
              onClick={() => navigate('/orders')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-save"
              disabled={saving}
            >
              {saving ? 'Saving...' : (isEditMode ? 'Update Order' : 'Create Order')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditOrder;
