import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from './Sidebar.js';
import Loader from './Loader.js';
import '../styles.css';
import { storage } from '../utils/storage';
import { orderAPI, productAPI, measurementsAPI, addonsAPI, customerAPI, uploadAPI, staffAPI } from '../services/api';
import { FiPlus, FiTrash2, FiUpload, FiX, FiArrowLeft } from 'react-icons/fi';
import { useLoading } from '../contexts/LoadingContext.js';

const AddEditOrder = ({ onLogout }) => {
  const user = JSON.parse(localStorage.getItem("naari_user"));
  const isAdmin = user?.type === "admin";
  const navigate = useNavigate();
  const { orderId } = useParams();
  const isEditMode = Boolean(orderId);
  const { setLoading: setGlobalLoading, isLoading: isGloballyLoading, isAnyLoading } = useLoading();

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
    assignWorker: [], // Array of {workerId, status, description} objects
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
    // Additional pricing fields
    khakhaDays: '',
    khakhaPrice: '',
    artWorkDays: '',
    artWorkPrice: '',
    sellingPrice: '',
    diffPercentage: '',
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
  const [initialLoading, setInitialLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('basic');
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  // Customer search state
  const [customerSearchInput, setCustomerSearchInput] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [filteredCustomers, setFilteredCustomers] = useState([]);

  // Product search state
  const [productSearchInput, setProductSearchInput] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);

  // Worker search state
  const [workerSearchInputs, setWorkerSearchInputs] = useState({});
  const [showWorkerDropdowns, setShowWorkerDropdowns] = useState({});
  const [filteredStaffLists, setFilteredStaffLists] = useState({});

  // Tab configuration - show only 3 tabs for create mode, all tabs for edit mode
  const tabs = isEditMode ? [
    { id: 'basic', label: 'Basic' },
    { id: 'measurements', label: 'Measurements' },
    { id: 'addons', label: 'Add Ons' },
    { id: 'fabric', label: 'Fabric' },
    // { id: 'fusing', label: 'Fusing' },
    { id: 'worktype', label: 'Art Work' },
    { id: 'embroidery', label: 'Stitching' },
    { id: 'otherwork', label: 'Other Work' },
    { id: 'assignworker', label: 'Assign Worker', adminOnly: true },
    { id: 'timeline', label: 'Time & Pricing', adminOnly: true }
  ] : [
    { id: 'basic', label: 'Basic' },
    { id: 'measurements', label: 'Measurements' },
    { id: 'addons', label: 'Add Ons' }
  ];

  useEffect(() => {
    loadInitialData();
  }, [orderId]);

  const loadInitialData = async () => {
    if (isDataLoading || isAnyLoading()) return; // Prevent multiple simultaneous calls

    setInitialLoading(true);
    setIsDataLoading(true);
    setGlobalLoading('initialData', true);
    setError('');

    try {
      if (isEditMode) {
        // In edit mode, first fetch the order
        await fetchOrder();

        // Then fetch other data
        await Promise.all([
          fetchCustomers(),
          fetchOutfitTypes(),
          fetchStaff()
        ]);

        // Fetch products only if orderType is product
        if (formData.orderType === 'product') {
          await fetchProducts();
        }
      } else {
        // In create mode, fetch all data including products
        await Promise.all([
          fetchCustomers(),
          fetchProducts(),
          fetchOutfitTypes(),
          fetchStaff()
        ]);
      }
    } catch (err) {
      console.error('Error loading initial data:', err);
      setError('Failed to load data. Please refresh the page.');
    } finally {
      setInitialLoading(false);
      setIsDataLoading(false);
      setGlobalLoading('initialData', false);
    }
  };

  const fetchStaff = async () => {
    try {
      const data = await staffAPI.getStaff();
      setStaffList(data || []);
    } catch (err) {
      console.error('Error fetching staff:', err);
      throw err;
    }
  };

  useEffect(() => {
    if (formData.outfitTypeId && formData.orderType === 'customized') {
      const outfit = outfitTypes.find(o => o._id === formData.outfitTypeId);
      setSelectedOutfit(outfit || null);
      fetchAddons(formData.outfitTypeId);

      // Only populate measurements from outfit type in create mode, not edit mode
      if (!isEditMode) {
        populateMeasurementsFromOutfitType(formData.outfitTypeId, formData.subCategoryName);
      }
    } else {
      setSelectedOutfit(null);
    }
  }, [formData.outfitTypeId, formData.orderType, outfitTypes, isEditMode]);

  // Re-fetch measurements when subcategory changes (only in create mode)
  useEffect(() => {
    if (formData.outfitTypeId && formData.orderType === 'customized' && formData.subCategoryName && !isEditMode) {
      populateMeasurementsFromOutfitType(formData.outfitTypeId, formData.subCategoryName);
    }
  }, [formData.outfitTypeId, formData.orderType, formData.subCategoryName, isEditMode]);

  // Initialize customer search input when editing existing order
  useEffect(() => {
    if (isEditMode && formData.customerId && customers.length > 0) {
      const customer = customers.find(c => c._id === formData.customerId);
      if (customer) {
        setCustomerSearchInput(customer.fullName);
      }
    }
  }, [isEditMode, formData.customerId, customers]);

  // Initialize product search input when editing existing order
  useEffect(() => {
    if (isEditMode && formData.productId && products.length > 0) {
      const product = products.find(p => p._id === formData.productId);
      if (product) {
        setProductSearchInput(product.name);
      }
    }
  }, [isEditMode, formData.productId, products]);

  // Initialize worker search inputs when editing existing order
  useEffect(() => {
    if (isEditMode && formData.assignWorker && staffList.length > 0) {
      const searchInputs = {};
      formData.assignWorker.forEach((assignment, index) => {
        if (assignment.workerId) {
          const staff = staffList.find(s => s._id === assignment.workerId);
          if (staff) {
            searchInputs[index] = staff.fullName;
          }
        }
      });
      setWorkerSearchInputs(searchInputs);
    }
  }, [isEditMode, formData.assignWorker, staffList]);

  useEffect(() => {
    if (formData.productId && formData.orderType === 'product') {
      fetchProductDetails(formData.productId);
    }
  }, [formData.productId, formData.orderType]);

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
      console.log('Fetched order data:', response);
      if (response) {
        const order = response.Data || response;
        setFormData({
          orderId: order.orderId || '',
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
              return { workerId, status: w.status || 'order_overview', description: w.description || '' };
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
          // Additional pricing fields
          khakhaDays: order.khakhaDays || '',
          khakhaPrice: order.khakhaPrice || '',
          artWorkDays: order.artWorkDays || '',
          artWorkPrice: order.artWorkPrice || '',
          sellingPrice: order.sellingPrice || '',
          diffPercentage: order.diffPercentage || '',
          totalDays: order.totalDays || '',
          totalPrice: order.totalPrice || '',
          advanceAmount: order.advanceAmount || '',
          deliveryDate: order.deliveryDate || '',
          specialInstructions: order.specialInstructions || ''
        });
      }
    } catch (err) {
      console.error('Error fetching order:', err);
      setError(err.response.data.Message || 'Failed to fetch order');
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

  const handleNumberInputWheel = (e) => {
    e.preventDefault();
  };

  const handleNumberInputKeyDown = (e) => {
    // Allow arrow keys for manual control but prevent scroll behavior
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
    }
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
      assignWorker: [...prev.assignWorker, { workerId: '', status: 'order_overview', description: '' }]
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

  // Calculate timeline total (for display only)
  const calculateTimelineTotal = () => {
    const fabricPurchasePrice = parseFloat(formData.fabricPurchasePrice) || 0;
    const dyeingPrice = parseFloat(formData.dyeingPrice) || 0;
    const embroideryPrice = parseFloat(formData.embroideryPrice) || 0;
    const stitichingPrice = parseFloat(formData.stitichingPrice) || 0;
    const otherWorkPrice = parseFloat(formData.otherWorkPrice) || 0;
    const packingPrice = parseFloat(formData.packingPrice) || 0;
    const khakhaPrice = parseFloat(formData.khakhaPrice) || 0;
    const artWorkPrice = parseFloat(formData.artWorkPrice) || 0;
    const fusingPrice = parseFloat(formData.fusingPrice) || 0;

    const totalPrice = fabricPurchasePrice + dyeingPrice + embroideryPrice + stitichingPrice + otherWorkPrice + packingPrice + khakhaPrice + artWorkPrice + fusingPrice;
    return totalPrice.toFixed(2);
  };

  // Auto-calculate total days only (total price is now user-editable)
  useEffect(() => {
    const fabricPurchaseDays = parseInt(formData.fabricPurchaseDays) || 0;
    const dyeingDays = parseInt(formData.dyeingDays) || 0;
    const embroideryDays = parseInt(formData.embroideryDays) || 0;
    const stitichingDays = parseInt(formData.stitichingDays) || 0;
    const otherWorkDays = parseInt(formData.otherWorkDays) || 0;
    const packingDays = parseInt(formData.packingDays) || 0;
    const khakhaDays = parseInt(formData.khakhaDays) || 0;
    const artWorkDays = parseInt(formData.artWorkDays) || 0;
    const fusingDays = parseInt(formData.fusingDays) || 0;

    const totalDays = fabricPurchaseDays + dyeingDays + embroideryDays + stitichingDays + otherWorkDays + packingDays + khakhaDays + artWorkDays + fusingDays;

    setFormData(prev => ({
      ...prev,
      totalDays: totalDays.toString()
    }));
  }, [
    formData.fabricPurchaseDays,
    formData.dyeingDays,
    formData.embroideryDays,
    formData.stitichingDays,
    formData.otherWorkDays,
    formData.packingDays,
    formData.khakhaDays,
    formData.artWorkDays,
    formData.fusingDays
  ]);

  // Auto-calculate total price from all work stage prices
  useEffect(() => {
    const fabricPurchasePrice = parseFloat(formData.fabricPurchasePrice) || 0;
    const dyeingPrice = parseFloat(formData.dyeingPrice) || 0;
    const embroideryPrice = parseFloat(formData.embroideryPrice) || 0;
    const stitichingPrice = parseFloat(formData.stitichingPrice) || 0;
    const otherWorkPrice = parseFloat(formData.otherWorkPrice) || 0;
    const packingPrice = parseFloat(formData.packingPrice) || 0;
    const khakhaPrice = parseFloat(formData.khakhaPrice) || 0;
    const artWorkPrice = parseFloat(formData.artWorkPrice) || 0;
    const fusingPrice = parseFloat(formData.fusingPrice) || 0;

    const totalPrice = fabricPurchasePrice + dyeingPrice + embroideryPrice + stitichingPrice + otherWorkPrice + packingPrice + khakhaPrice + artWorkPrice + fusingPrice;

    setFormData(prev => ({
      ...prev,
      totalPrice: totalPrice.toFixed(2)
    }));
  }, [
    formData.fabricPurchasePrice,
    formData.dyeingPrice,
    formData.embroideryPrice,
    formData.stitichingPrice,
    formData.otherWorkPrice,
    formData.packingPrice,
    formData.khakhaPrice,
    formData.artWorkPrice,
    formData.fusingPrice
  ]);

  // Auto-calculate diff percentage from selling price
  useEffect(() => {
    const totalCost = parseFloat(formData.totalPrice) || 0;
    const sellingPrice = parseFloat(formData.sellingPrice) || 0;

    // Only calculate if total cost and selling price are greater than 0
    if (totalCost > 0 && sellingPrice > 0) {
      const calculatedDiffPercentage = (((sellingPrice - totalCost) / totalCost) * 100).toFixed(1);
      setFormData(prev => ({
        ...prev,
        diffPercentage: calculatedDiffPercentage
      }));
    }
    // Reset diff percentage if selling price is 0 or empty
    else if (sellingPrice === 0) {
      setFormData(prev => ({
        ...prev,
        diffPercentage: '0.0'
      }));
    }
  }, [formData.totalPrice, formData.sellingPrice]);

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

    // Prevent upload if already uploading for this field or if any global loading is happening
    if (uploadProgress[field] || isAnyLoading()) return;

    const newFiles = Array.from(files);

    // Set loading state for this field
    setUploadProgress(prev => ({ ...prev, [field]: true }));
    setGlobalLoading(`upload-${field}`, true);

    try {
      // Upload each image one by one for specific field
      const uploadPromises = newFiles.map(async (file) => {
        try {
          // Pass file directly to uploadAPI.uploadImage (not FormData)
          const response = await uploadAPI.uploadImage(file);

          // Handle response structure: response.data.Data contains the image data
          const imageUrl = response?.url || response?.Data?.url || response;

          return {
            url: imageUrl,
            originalUrl: URL.createObjectURL(file),
            isNew: true,
            uploaded: true,
            field: field // Track which field this image belongs to
          };
        } catch (error) {
          console.error(`Error uploading image for field ${field}:`, error);
          // Return blob URL as fallback
          return {
            url: URL.createObjectURL(file),
            originalUrl: URL.createObjectURL(file),
            isNew: true,
            uploaded: false,
            field: field
          };
        }
      });

      // Wait for all uploads to complete for this specific field
      const uploadedImages = await Promise.all(uploadPromises);

      // Update form data with uploaded images for this specific field only
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], ...uploadedImages.map(img => img.url)]
      }));
    } finally {
      // Clear loading state for this field
      setUploadProgress(prev => ({ ...prev, [field]: false }));
      setGlobalLoading(`upload-${field}`, false);
    }
  };

  const removeImage = (field, index) => {
    setFormData(prev => {
      const updated = [...prev[field]];
      updated.splice(index, 1);

      return { ...prev, [field]: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent multiple submissions and API calls during loading
    if (saving || isDataLoading || isAnyLoading()) return;

    setSaving(true);
    setGlobalLoading('saving', true);
    setError('');

    try {
      // Process each image field separately - filter out blob URLs and keep only uploaded URLs
      const getUploadedImageUrls = (imageArray) => {
        return imageArray.filter(img => !img.startsWith('blob:')).map(img => img);
      };

      // Build payload with separate image arrays for each field
      const payload = {
        customerId: formData.customerId,
        orderType: formData.orderType,
        productId: formData.orderType === 'product' ? formData.productId : '',
        outfitTypeId: formData.orderType === 'customized' ? formData.outfitTypeId : '',
        subCategoryName: formData.subCategoryName,

        // Each image field maintains its own separate array with uploaded URLs only
        outfitStyleRefImg: getUploadedImageUrls(formData.outfitStyleRefImg || []),
        fabricRefImg: getUploadedImageUrls(formData.fabricRefImg || []),
        workTypeRefImg: getUploadedImageUrls(formData.workTypeRefImg || []),
        embroideryRefImg: getUploadedImageUrls(formData.embroideryRefImg || []),
        stitichingRefImg: getUploadedImageUrls(formData.stitichingRefImg || []),
        otherWorkRefImg: getUploadedImageUrls(formData.otherWorkRefImg || []),

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
        })),

        // Timeline and pricing fields
        fabricPurchaseDays: parseInt(formData.fabricPurchaseDays) || 0,
        fabricPurchasePrice: parseFloat(formData.fabricPurchasePrice) || 0,
        dyeingDays: parseInt(formData.dyeingDays) || 0,
        dyeingPrice: parseFloat(formData.dyeingPrice) || 0,
        embroideryDays: parseInt(formData.embroideryDays) || 0,
        embroideryPrice: parseFloat(formData.embroideryPrice) || 0,
        stitichingDays: parseInt(formData.stitichingDays) || 0,
        stitichingPrice: parseFloat(formData.stitichingPrice) || 0,
        otherWorkDays: parseInt(formData.otherWorkDays) || 0,
        otherWorkPrice: parseFloat(formData.otherWorkPrice) || 0,
        packingDays: parseInt(formData.packingDays) || 0,
        packingPrice: parseFloat(formData.packingPrice) || 0,
        khakhaDays: parseInt(formData.khakhaDays) || 0,
        khakhaPrice: parseFloat(formData.khakhaPrice) || 0,
        artWorkDays: parseInt(formData.artWorkDays) || 0,
        artWorkPrice: parseFloat(formData.artWorkPrice) || 0,
        totalDays: parseInt(formData.totalDays) || 0,
        totalPrice: parseFloat(formData.totalPrice) || 0,
        sellingPrice: parseFloat(formData.sellingPrice) || 0,
        diffPercentage: parseFloat(formData.diffPercentage) || 0,
        advanceAmount: parseFloat(formData.advanceAmount) || 0,
        deliveryDate: formData.deliveryDate,
        specialInstructions: formData.specialInstructions
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
        payload.embroideryWorkNotes = formData.embroideryWorkNotes;
        payload.assignWorker = formData.assignWorker;
        payload.stitichingStyle = formData.stitichingStyle;
        payload.stitichingNotes = formData.stitichingNotes;
        payload.otherWork = formData.otherWork;

        // console.log(payload)
        await orderAPI.updateOrder(payload);
        navigate('/orders');
      } else {
        const newOrder = await orderAPI.createOrder(payload);
        navigate(`/orders/edit/${newOrder._id}`);
      }
    } catch (err) {
      console.error('Error saving order:', err);
      setError(err.response.data.Message || 'Failed to save order');
    } finally {
      setSaving(false);
      setGlobalLoading('saving', false);
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

  // Customer search handlers
  const handleCustomerSearch = (e) => {
    const value = e.target.value;
    setCustomerSearchInput(value);

    if (value.trim() === '') {
      // Show all customers when input is empty but dropdown is open
      setFilteredCustomers(customers);
      setShowCustomerDropdown(true);
    } else {
      const filtered = customers.filter(customer =>
        customer.fullName.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredCustomers(filtered);
      setShowCustomerDropdown(true);
    }
  };

  const handleCustomerFocus = () => {
    // Show all customers when input is focused
    setFilteredCustomers(customers);
    setShowCustomerDropdown(true);
  };

  const handleCustomerSelect = (customer) => {
    setCustomerSearchInput(customer.fullName);
    handleInputChange('customerId', customer._id);
    setShowCustomerDropdown(false);
    setFilteredCustomers([]);
  };

  const handleCustomerInputBlur = () => {
    // Delay hiding dropdown to allow click on dropdown items
    setTimeout(() => {
      setShowCustomerDropdown(false);
    }, 200);
  };

  // Worker search handlers
  const handleWorkerSearch = (index, value) => {
    setWorkerSearchInputs(prev => ({ ...prev, [index]: value }));

    if (value.trim() === '') {
      // Show all staff when input is empty but dropdown is open
      setFilteredStaffLists(prev => ({ ...prev, [index]: staffList }));
      setShowWorkerDropdowns(prev => ({ ...prev, [index]: true }));
    } else {
      const filtered = staffList.filter(staff =>
        staff.fullName.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredStaffLists(prev => ({ ...prev, [index]: filtered }));
      setShowWorkerDropdowns(prev => ({ ...prev, [index]: true }));
    }
  };

  const handleWorkerFocus = (index) => {
    // Show all staff when input is focused
    setFilteredStaffLists(prev => ({ ...prev, [index]: staffList }));
    setShowWorkerDropdowns(prev => ({ ...prev, [index]: true }));
  };

  const handleWorkerSelect = (index, staff) => {
    const newSearchInputs = { ...workerSearchInputs };
    newSearchInputs[index] = staff.fullName;
    setWorkerSearchInputs(newSearchInputs);
    handleWorkerAssignmentChange(index, 'workerId', staff._id);
    setShowWorkerDropdowns(prev => ({ ...prev, [index]: false }));
    setFilteredStaffLists(prev => ({ ...prev, [index]: [] }));
  };

  const handleWorkerInputBlur = (index) => {
    // Delay hiding dropdown to allow click on dropdown items
    setTimeout(() => {
      setShowWorkerDropdowns(prev => ({ ...prev, [index]: false }));
    }, 200);
  };

  // Product search handlers
  const handleProductSearch = (e) => {
    const value = e.target.value;
    setProductSearchInput(value);

    if (value.trim() === '') {
      // Show all products when input is empty but dropdown is open
      setFilteredProducts(products);
      setShowProductDropdown(true);
    } else {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredProducts(filtered);
      setShowProductDropdown(true);
    }
  };

  const handleProductFocus = () => {
    // Show all products when input is focused
    setFilteredProducts(products);
    setShowProductDropdown(true);
  };

  const handleProductSelect = (product) => {
    setProductSearchInput(product.name);
    handleInputChange('productId', product._id);
    setShowProductDropdown(false);
    setFilteredProducts([]);
  };

  const handleProductInputBlur = () => {
    // Delay hiding dropdown to allow click on dropdown items
    setTimeout(() => {
      setShowProductDropdown(false);
    }, 200);
  };

  // Render searchable customer input
  const renderCustomerSearchInput = () => (
    <div className="customer-search-container" style={{ position: 'relative' }}>
      <input
        type="text"
        className="input-field"
        value={customerSearchInput}
        onChange={handleCustomerSearch}
        onFocus={handleCustomerFocus}
        onBlur={handleCustomerInputBlur}
        placeholder="Click to see all customers or type to search..."
        required
        style={{ width: '100%' }}
      />
      {showCustomerDropdown && filteredCustomers.length > 0 && (
        <div
          className="customer-dropdown"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'var(--background-light)',
            border: '1px solid var(--border-color)',
            borderTop: 'none',
            borderRadius: '0 0 var(--radius-md) var(--radius-md)',
            maxHeight: '200px',
            overflowY: 'auto',
            zIndex: 1000,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            padding: '8px'
          }}
        >
          {filteredCustomers.map((customer) => (
            <div
              key={customer._id}
              className="customer-dropdown-item"
              onClick={() => handleCustomerSelect(customer)}
              style={{
                padding: '10px 12px',
                cursor: 'pointer',
                borderBottom: '1px solid var(--border-color)',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'var(--primary-light)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              <div style={{ fontWeight: '500' }}>{customer.fullName}</div>
              {customer.email && (
                <div style={{ fontSize: '12px', color: 'var(--gray-color)' }}>
                  {customer.email}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Render searchable worker input
  const renderWorkerSearchInput = (index) => (
    <div className="worker-search-container" style={{ position: 'relative' }}>
      <input
        type="text"
        className="input-field"
        value={workerSearchInputs[index] || ''}
        onChange={(e) => handleWorkerSearch(index, e.target.value)}
        onFocus={() => handleWorkerFocus(index)}
        onBlur={() => handleWorkerInputBlur(index)}
        placeholder="Click to see all workers or type to search..."
        disabled={formData.orderType === 'product'}
        style={{ width: '100%' }}
      />
      {showWorkerDropdowns[index] && filteredStaffLists[index] && filteredStaffLists[index].length > 0 && (
        <div
          className="worker-dropdown"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'var(--background-light)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            zIndex: 1000,
            maxHeight: '200px',
            overflowY: 'auto',
            padding: '8px'
          }}
        >
          {filteredStaffLists[index].map((staff) => (
            <div
              key={staff._id}
              className="worker-dropdown-item"
              onClick={() => handleWorkerSelect(index, staff)}
              style={{
                padding: '10px 12px',
                cursor: 'pointer',
                borderBottom: '1px solid var(--border-color)',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'var(--primary-light)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              <div style={{ fontWeight: '500' }}>{staff.fullName}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Render searchable product input
  const renderProductSearchInput = () => (
    <div className="product-search-container" style={{ position: 'relative' }}>
      <input
        type="text"
        className="input-field"
        value={productSearchInput}
        onChange={handleProductSearch}
        onFocus={handleProductFocus}
        onBlur={handleProductInputBlur}
        placeholder="Click to see all products or type to search..."
        required
        style={{ width: '100%' }}
      />
      {showProductDropdown && filteredProducts.length > 0 && (
        <div
          className="product-dropdown"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'var(--background-light)',
            border: '1px solid var(--border-color)',
            borderTop: 'none',
            borderRadius: '0 0 var(--radius-md) var(--radius-md)',
            maxHeight: '200px',
            overflowY: 'auto',
            zIndex: 1000,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}
        >
          {filteredProducts.map((product) => (
            <div
              key={product._id}
              className="product-dropdown-item"
              onClick={() => handleProductSelect(product)}
              style={{
                padding: '10px 12px',
                cursor: 'pointer',
                borderBottom: '1px solid var(--border-color)',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'var(--primary-light)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              <div style={{ fontWeight: '500' }}>{product.name}</div>
              {product.outfitTypeId?.name && (
                <div style={{ fontSize: '12px', color: 'var(--gray-color)' }}>
                  {product.outfitTypeId.name}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Render tab navigation
  const renderTabNavigation = () => (
    <div className="tabs">
      <div className="order-tabs">
        {tabs
          .filter(tab => isAdmin || !tab.adminOnly)
          .map((tab) => (
            <button
              key={tab.id}
              className={`tab tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => handleTabChange(tab.id)}
            >
              {tab.label}
            </button>
          ))}
      </div>
    </div>
  );

  if (initialLoading) {
    return (
      <div className="settings-container">
        <Sidebar onLogout={handleLogout} />
        <div className="main-content">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Loader
              size="large"
              text={isEditMode ? 'Loading order details...' : 'Loading form data...'}
            />
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
          <h1 className="page-title">{isEditMode ? `Edit Order - ${formData.orderId}` : 'Add New Order'}</h1>
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
        <div style={{ position: 'relative' }}>
          <form onSubmit={handleSubmit} className="content-section product-form">
            {(saving || Object.values(uploadProgress).some(Boolean)) && (
              <Loader
                overlay={true}
                text={saving ? 'Saving order...' : 'Uploading images...'}
              />
            )}

            {/* Basic Information Tab */}
            {activeTab === 'basic' && (
              <div className="tab-content">
                <div className="form-section">
                  <h3 className="section-title form-section-title">Basic Information</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Customer <span className="required">*</span></label>
                      {renderCustomerSearchInput()}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Order Type <span className="required">*</span></label>
                      <div className="radio-group">
                        <label className="radio-label">
                          <input
                            type="radio"
                            name="orderType"
                            value="product"
                            checked={formData.orderType === 'product'}
                            onChange={(e) => handleInputChange('orderType', e.target.value)}
                            required
                          />
                          <span>Product</span>
                        </label>
                        <label className="radio-label">
                          <input
                            type="radio"
                            name="orderType"
                            value="customized"
                            checked={formData.orderType === 'customized'}
                            onChange={(e) => handleInputChange('orderType', e.target.value)}
                            required
                          />
                          <span>Customized</span>
                        </label>
                      </div>
                    </div>

                    {formData.orderType === 'product' && (
                      <div className="form-group">
                        <label className="form-label">Product <span className="required">*</span></label>
                        {renderProductSearchInput()}
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
              </div>
            )}

            {/* Measurements Tab */}
            {activeTab === 'measurements' && (formData.orderType === 'customized' || formData.orderType === 'product') && (
              <div className="tab-content">
                <div className="form-section">
                  <h3 className="section-title form-section-title">Measurements</h3>
                  {formData.measurement.length > 0 ? (
                    <div className="measurements-grid">
                      {formData.measurement.map((measure, index) => (
                        <div key={index} className="measurement-item">
                          <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label">{measure.fieldLable} ({measure.unit})</label>
                            <input
                              type="text"
                              className={`input-field ${formData.orderType === 'product' ? 'input-disabled' : ''}`}
                              value={measure.fieldValue}
                              onChange={(e) => handleMeasurementChange(index, 'fieldValue', e.target.value)}
                              placeholder={`Enter value in ${measure.unit}`}
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
              </div>
            )}

            {/* Add Ons Tab */}
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
                            <select
                              className={`input-field ${formData.orderType === 'product' ? 'input-disabled' : ''}`}
                              value={formData.fusingColor}
                              onChange={(e) => handleInputChange('fusingColor', e.target.value)}
                              disabled={formData.orderType === 'product'}
                              style={{ maxWidth: '200px' }}
                            >
                              <option value="">Select Color</option>
                              <option value="Black">Black</option>
                              <option value="White">White</option>
                            </select>
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
                      <h3 className="section-title form-section-title">Art Work</h3>
                      <div className="form-group full-width">
                        <label className="form-label">Art Work</label>
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
                              No Art work types added. Enter a work type and click Add.
                            </span>
                          )}
                        </div>
                        <div className="form-group full-width">
                          <label className="form-label">Art Work Notes</label>
                          <textarea
                            className={`input-field ${formData.orderType === 'product' ? 'input-disabled' : ''}`}
                            rows="2"
                            value={formData.embroideryWorkNotes}
                            onChange={(e) => handleInputChange('embroideryWorkNotes', e.target.value)}
                            placeholder="Enter Art Work notes..."
                            disabled={formData.orderType === 'product'}
                          />
                        </div>
                        {/* Work Type Reference Images */}
                        <div className="form-group full-width" style={{ marginTop: '16px' }}>
                          <label className="form-label">Art Work Reference Images</label>
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
                  </div>
                )}

                {/* Embroidery & Stitching Tab */}
                {activeTab === 'embroidery' && (
                  <div className="tab-content">
                    <div className="form-section">
                      <h3 className="section-title form-section-title">Stitching</h3>
                      <div className="form-grid">

                        {/* Embroidery Reference Images */}

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
                        {/* Stitching Reference Images */}
                        <div className="form-group full-width">
                          <label className="form-label">Stitching Reference Images</label>
                          <div className="image-upload-container">
                            {formData.stitichingRefImg.map((img, index) => (
                              <div key={index} className="image-preview">
                                <img src={img} alt={`Stitching ${index + 1}`} />
                                <button
                                  type="button"
                                  className="image-remove-btn"
                                  onClick={() => removeImage('stitichingRefImg', index)}
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
                                onChange={(e) => handleImageUpload('stitichingRefImg', e.target.files)}
                                disabled={formData.orderType === 'product'}
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Other Work Tab */}
                {activeTab === 'otherwork' && (
                  <div className="tab-content">
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
                      {/* Other Work Reference Images */}
                      <div className="form-group full-width">
                        <label className="form-label">Other Work Reference Images</label>
                        <div className="image-upload-container">
                          {formData.otherWorkRefImg.map((img, index) => (
                            <div key={index} className="image-preview">
                              <img src={img} alt={`Other Work ${index + 1}`} />
                              <button
                                type="button"
                                className="image-remove-btn"
                                onClick={() => removeImage('otherWorkRefImg', index)}
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
                              onChange={(e) => handleImageUpload('otherWorkRefImg', e.target.files)}
                              disabled={formData.orderType === 'product'}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Assign Worker Tab */}
                {activeTab === 'assignworker' && (
                  <div className="tab-content">
                    <div className="form-section">
                      <div className='heading_button'>
                        <h3 className="section-title form-section-title">Assign Worker </h3>
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
                      <div className="form-group full-width">
                        <label className="form-label">Assign Workers</label>
                        {formData.assignWorker.map((assignment, index) => (
                          <div key={index} className="worker-assignment-row" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px', alignItems: 'stretch' }}>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              {renderWorkerSearchInput(index)}
                              <select
                                className={`input-field ${formData.orderType === 'product' ? 'input-disabled' : ''}`}

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
                                <option value="delivery">Delivery</option>
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
                            <div className="form-group full-width">
                              <label className="form-label">Description</label>
                              <textarea
                                className="input-field"
                                rows="2"
                                value={assignment.description || ''}
                                onChange={(e) => handleWorkerAssignmentChange(index, 'description', e.target.value)}
                                placeholder="Enter worker assignment description..."
                                disabled={formData.orderType === 'product'}
                              />
                            </div>
                          </div>
                        ))}

                      </div>
                    </div>
                  </div>
                )}

                {/* Timeline & Pricing Tab */}
                {activeTab === 'timeline' && (
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
                            <input
                              type="number"
                              className="table-input"
                              value={formData.fabricPurchaseDays}
                              onChange={(e) => handleInputChange('fabricPurchaseDays', e.target.value)}
                              onWheel={handleNumberInputWheel}
                              onKeyDown={handleNumberInputKeyDown}
                              placeholder="0"
                            />
                            <input
                              type="number"
                              className="table-input"
                              value={formData.fabricPurchasePrice}
                              onChange={(e) => handleInputChange('fabricPurchasePrice', e.target.value)}
                              onWheel={handleNumberInputWheel}
                              onKeyDown={handleNumberInputKeyDown}
                              placeholder="0"
                            />
                          </div>

                          <div className="row">
                            <span>Dyeing Work</span>
                            <input
                              type="number"
                              className="table-input"
                              value={formData.dyeingDays}
                              onChange={(e) => handleInputChange('dyeingDays', e.target.value)}
                              onWheel={handleNumberInputWheel}
                              onKeyDown={handleNumberInputKeyDown}
                              placeholder="0"
                            />
                            <input
                              type="number"
                              className="table-input"
                              value={formData.dyeingPrice}
                              onChange={(e) => handleInputChange('dyeingPrice', e.target.value)}
                              onWheel={handleNumberInputWheel}
                              onKeyDown={handleNumberInputKeyDown}
                              placeholder="0"
                            />
                          </div>

                          <div className="row">
                            <span>Embroidery Work</span>
                            <input
                              type="number"
                              className="table-input"
                              value={formData.embroideryDays}
                              onChange={(e) => handleInputChange('embroideryDays', e.target.value)}
                              onWheel={handleNumberInputWheel}
                              onKeyDown={handleNumberInputKeyDown}
                              placeholder="0"
                            />
                            <input
                              type="number"
                              className="table-input"
                              value={formData.embroideryPrice}
                              onChange={(e) => handleInputChange('embroideryPrice', e.target.value)}
                              onWheel={handleNumberInputWheel}
                              onKeyDown={handleNumberInputKeyDown}
                              placeholder="0"
                            />
                          </div>

                          <div className="row">
                            <span>Stitching Work</span>
                            <input
                              type="number"
                              className="table-input"
                              value={formData.stitichingDays}
                              onChange={(e) => handleInputChange('stitichingDays', e.target.value)}
                              onWheel={handleNumberInputWheel}
                              onKeyDown={handleNumberInputKeyDown}
                              placeholder="0"
                            />
                            <input
                              type="number"
                              className="table-input"
                              value={formData.stitichingPrice}
                              onChange={(e) => handleInputChange('stitichingPrice', e.target.value)}
                              onWheel={handleNumberInputWheel}
                              onKeyDown={handleNumberInputKeyDown}
                              placeholder="0"
                            />
                          </div>

                          <div className="row">
                            <span>Other Work</span>
                            <input
                              type="number"
                              className="table-input"
                              value={formData.otherWorkDays}
                              onChange={(e) => handleInputChange('otherWorkDays', e.target.value)}
                              onWheel={handleNumberInputWheel}
                              onKeyDown={handleNumberInputKeyDown}
                              placeholder="0"
                            />
                            <input
                              type="number"
                              className="table-input"
                              value={formData.otherWorkPrice}
                              onChange={(e) => handleInputChange('otherWorkPrice', e.target.value)}
                              onWheel={handleNumberInputWheel}
                              onKeyDown={handleNumberInputKeyDown}
                              placeholder="0"
                            />
                          </div>

                          <div className="row">
                            <span>QC + Packing</span>
                            <input
                              type="number"
                              className="table-input"
                              value={formData.packingDays}
                              onChange={(e) => handleInputChange('packingDays', e.target.value)}
                              onWheel={handleNumberInputWheel}
                              onKeyDown={handleNumberInputKeyDown}
                              placeholder="0"
                            />
                            <input
                              type="number"
                              className="table-input"
                              value={formData.packingPrice}
                              onChange={(e) => handleInputChange('packingPrice', e.target.value)}
                              onWheel={handleNumberInputWheel}
                              onKeyDown={handleNumberInputKeyDown}
                              placeholder="0"
                            />
                          </div>

                          <div className="row">
                            <span>Khakha Work</span>
                            <input
                              type="number"
                              className="table-input"
                              value={formData.khakhaDays}
                              onChange={(e) => handleInputChange('khakhaDays', e.target.value)}
                              onWheel={handleNumberInputWheel}
                              onKeyDown={handleNumberInputKeyDown}
                              placeholder="0"
                            />
                            <input
                              type="number"
                              className="table-input"
                              value={formData.khakhaPrice}
                              onChange={(e) => handleInputChange('khakhaPrice', e.target.value)}
                              onWheel={handleNumberInputWheel}
                              onKeyDown={handleNumberInputKeyDown}
                              placeholder="0"
                            />
                          </div>

                          <div className="row">
                            <span>Art Work</span>
                            <input
                              type="number"
                              className="table-input"
                              value={formData.artWorkDays}
                              onChange={(e) => handleInputChange('artWorkDays', e.target.value)}
                              onWheel={handleNumberInputWheel}
                              onKeyDown={handleNumberInputKeyDown}
                              placeholder="0"
                            />
                            <input
                              type="number"
                              className="table-input"
                              value={formData.artWorkPrice}
                              onChange={(e) => handleInputChange('artWorkPrice', e.target.value)}
                              onWheel={handleNumberInputWheel}
                              onKeyDown={handleNumberInputKeyDown}
                              placeholder="0"
                            />
                          </div>
                        </div>

                        {/* Individual Price Breakdown */}
                        {/* <div style={{ 
                        marginTop: '20px', 
                        padding: '15px', 
                        background: '#f8f9fa', 
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)'
                      }}>
                        <h4 style={{ 
                          margin: '0 0 12px 0', 
                          fontSize: '14px', 
                          color: 'var(--gray-color)', 
                          textTransform: 'uppercase',
                          fontWeight: '600'
                        }}>
                          Price Breakdown
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #e9ecef' }}>
                            <span style={{ fontSize: '12px', color: 'var(--gray-color)' }}>Fabric Purchase:</span>
                            <span style={{ fontSize: '12px', fontWeight: '600' }}>₹{parseFloat(formData.fabricPurchasePrice) || 0}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #e9ecef' }}>
                            <span style={{ fontSize: '12px', color: 'var(--gray-color)' }}>Dyeing / Color:</span>
                            <span style={{ fontSize: '12px', fontWeight: '600' }}>₹{parseFloat(formData.dyeingPrice) || 0}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #e9ecef' }}>
                            <span style={{ fontSize: '12px', color: 'var(--gray-color)' }}>Embroidery / Art:</span>
                            <span style={{ fontSize: '12px', fontWeight: '600' }}>₹{parseFloat(formData.embroideryPrice) || 0}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #e9ecef' }}>
                            <span style={{ fontSize: '12px', color: 'var(--gray-color)' }}>Stitching:</span>
                            <span style={{ fontSize: '12px', fontWeight: '600' }}>₹{parseFloat(formData.stitichingPrice) || 0}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #e9ecef' }}>
                            <span style={{ fontSize: '12px', color: 'var(--gray-color)' }}>Other / Finishing:</span>
                            <span style={{ fontSize: '12px', fontWeight: '600' }}>₹{parseFloat(formData.otherWorkPrice) || 0}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #e9ecef' }}>
                            <span style={{ fontSize: '12px', color: 'var(--gray-color)' }}>QC + Packing:</span>
                            <span style={{ fontSize: '12px', fontWeight: '600' }}>₹{parseFloat(formData.packingPrice) || 0}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #e9ecef' }}>
                            <span style={{ fontSize: '12px', color: 'var(--gray-color)' }}>Khakha:</span>
                            <span style={{ fontSize: '12px', fontWeight: '600' }}>₹{parseFloat(formData.khakhaPrice) || 0}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #e9ecef' }}>
                            <span style={{ fontSize: '12px', color: 'var(--gray-color)' }}>Art Work:</span>
                            <span style={{ fontSize: '12px', fontWeight: '600' }}>₹{parseFloat(formData.artWorkPrice) || 0}</span>
                          </div>
                        </div>
                      </div> */}

                        <div className="total">
                          <span>TOTAL (Timeline)</span>
                          <div>
                            <span>{formData.totalDays || 0} days</span>
                            <span>₹{calculateTimelineTotal()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Pricing & Delivery Section */}
                      <div className="pricing">
                        <h3 className="section-title form-section-title">Pricing & Delivery</h3>

                        <div className="form-row">
                          <div>
                            <label>Total Cost (₹)</label>
                            <input
                              type="number"
                              className="input-field input-disabled"
                              value={formData.totalPrice}
                              disabled
                              placeholder="Auto-calculated"
                              style={{
                                background: '#f8f9fa',
                                cursor: 'not-allowed'
                              }}
                            />
                          </div>
                          <div>
                            <label>Selling Price (₹)</label>
                            <input
                              type="number"
                              className="input-field"
                              value={formData.sellingPrice}
                              onChange={(e) => handleInputChange('sellingPrice', e.target.value)}
                              onWheel={handleNumberInputWheel}
                              onKeyDown={handleNumberInputKeyDown}
                              placeholder="Enter selling price"
                            />
                          </div>
                          <div>
                            <label>Diff Percentage (%)</label>
                            <input
                              type="number"
                              className="input-field input-disabled"
                              value={formData.diffPercentage}
                              disabled
                              placeholder="Auto-calculated"
                              step="0.1"
                              style={{
                                background: '#f8f9fa',
                                cursor: 'not-allowed'
                              }}
                            />
                          </div>
                        </div>
                        <div className='form-row'>
                          <div>
                            <label>Advance (₹)</label>
                            <input
                              type="number"
                              className="input-field"
                              value={formData.advanceAmount}
                              onChange={(e) => handleInputChange('advanceAmount', e.target.value)}
                              onWheel={handleNumberInputWheel}
                              onKeyDown={handleNumberInputKeyDown}
                              placeholder="Advance Amount"
                            />
                          </div>
                          <div>
                            <label>Pending (₹)</label>
                            <div className="value-box">{formData.sellingPrice - formData.advanceAmount || 0}</div>
                          </div>
                          <div>
                            <label>Delivery Date</label>
                            <input
                              type="date"
                              className="input-field"
                              value={formData.deliveryDate}
                              onChange={(e) => handleInputChange('deliveryDate', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Special Instructions */}
                      <div className='form-group full-width'>
                        <label>Special Instructions</label>
                        <textarea
                          className="input-field"
                          rows="2"
                          value={formData.specialInstructions}
                          onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                          placeholder="Enter special instructions..."
                          style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', lineHeight: '1.6' }}
                        />
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
    </div>
  );
};

export default AddEditOrder;
