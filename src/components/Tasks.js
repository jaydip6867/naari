import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar.js';
import '../styles.css';
import { storage } from '../utils/storage';
import { taskAPI } from '../services/api';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiEye, FiPackage } from 'react-icons/fi';

const Tasks = ({ onLogout }) => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]); // Store all tasks for filtering
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [refImages, setRefImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isEndingTask, setIsEndingTask] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await taskAPI.getTasks(); // Fetch all tasks without search
      const tasksData = Array.isArray(response) ? response : (response || []);
      setAllTasks(tasksData); // Store all tasks
      setTasks(tasksData); // Initially display all tasks
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError(error.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const query = e.target.value;
    setSearchQuery(query);
    
    // Filter tasks locally
    if (!query.trim()) {
      setTasks(allTasks); // Show all tasks if search is empty
    } else {
      const filteredTasks = allTasks.filter(task => {
        const searchLower = query.toLowerCase();
        return (
          (task._id && task._id.toLowerCase().includes(searchLower)) ||
          (task.customerId && task.customerId.fullName && task.customerId.fullName.toLowerCase().includes(searchLower)) ||
          (task.productName && task.productName.toLowerCase().includes(searchLower)) ||
          (task.outfitTypeName && task.outfitTypeName.toLowerCase().includes(searchLower)) ||
          (task.assignWorker && task.assignWorker.fullName && task.assignWorker.fullName.toLowerCase().includes(searchLower)) ||
          (task.status && task.status.toLowerCase().includes(searchLower))
        );
      });
      setTasks(filteredTasks);
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowTaskDetail(true);
  };

  const handleStartTask = async (taskId) => {
    try {
      await taskAPI.startTask(taskId);
      alert('Task started successfully');
      fetchTasks();
      // Update selected task status locally
      if (selectedTask && selectedTask._id === taskId) {
        setSelectedTask(prev => ({ ...prev, status: 'in_progress' }));
      }
    } catch (error) {
      console.error('Error starting task:', error);
      alert('Failed to start task: ' + error.message);
    }
  };

  const handlePauseTask = async (taskId) => {
    try {
      await taskAPI.pauseTask(taskId);
      alert('Task paused successfully');
      fetchTasks();
      // Update selected task status locally
      if (selectedTask && selectedTask._id === taskId) {
        setSelectedTask(prev => ({ ...prev, status: 'paused' }));
      }
    } catch (error) {
      console.error('Error pausing task:', error);
      alert('Failed to pause task: ' + error.message);
    }
  };

  const handleEndTask = async (taskId) => {
    try {
      await taskAPI.endTask(taskId, refImages);
      alert('Task ended successfully');
      fetchTasks();
      setShowTaskDetail(false);
      setRefImages([]);
      setImagePreviews([]);
    } catch (error) {
      console.error('Error ending task:', error);
      alert('Failed to end task: ' + error.message);
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      // For now, create preview URLs
      const previews = files.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...previews]);
      
      // You can integrate with uploadAPI.uploadMultipleImages if needed
      // const uploadedImages = await uploadAPI.uploadMultipleImages(files);
      // setRefImages(uploadedImages);
      
      // For now, store file names as refImages
      const imageNames = files.map(file => file.name);
      setRefImages(prev => [...prev, ...imageNames]);
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Failed to upload images: ' + error.message);
    }
  };

  const removeImage = (index) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setRefImages(prev => prev.filter((_, i) => i !== index));
  };

  const getTaskStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffc107';
      case 'in_progress': return '#28a745';
      case 'paused': return '#fd7e14';
      case 'completed': return '#007bff';
      default: return '#6c757d';
    }
  };

  const getTaskStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'in_progress': return 'In Progress';
      case 'paused': return 'Paused';
      case 'completed': return 'Completed';
      default: return 'Unknown';
    }
  };

  const handleLogout = () => {
    storage.clearAuthData();
    onLogout();
    navigate('/');
  };

  return (
    <div className="settings-container">
      {/* Sidebar */}
      <Sidebar onLogout={handleLogout} />

      {/* Main Content */}
      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">Task Management</h1>
        </div>

        <div className="content-section">
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
          
          <div className="section-header" style={{ flexWrap: 'wrap', gap: '16px' }}>
            <h2 className="section-title">Tasks</h2>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', flex: 1, justifyContent: 'flex-end' }}>
              <div className="search-container" style={{ position: 'relative' }}>
                <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-color)' }} />
                <input
                  type="text"
                  placeholder="Search tasks..."
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
            </div>
          </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--primary-color)' }}>Loading tasks...</div>
            ) : tasks.length > 0 ? (
              <div className="table-container" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--background-light)', borderBottom: '2px solid var(--border-color)' }}>
                      {/* <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--primary-dark)' }}>Order ID</th> */}
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--primary-dark)' }}>Customer</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--primary-dark)' }}>Product</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--primary-dark)' }}>Outfit Type</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--primary-dark)' }}>Assigned To</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--primary-dark)' }}>Delivery Date</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--primary-dark)' }}>Price</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--primary-dark)' }}>Status</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: 'var(--primary-dark)' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((task) => (
                      <tr key={task._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        {/* <td style={{ padding: '12px' }}>
                          <span className="order-id">{task._id?.slice(-6) || '-'}</span>
                        </td> */}
                        <td style={{ padding: '12px' }}>{task.customerId?.fullName || 'N/A'}</td>
                        <td style={{ padding: '12px' }}>{task.productName || 'N/A'}</td>
                        <td style={{ padding: '12px' }}>{task.outfitTypeName || 'N/A'}</td>
                        <td style={{ padding: '12px' }}>{task.assignWorker?.fullName || 'Not assigned'}</td>
                        <td style={{ padding: '12px' }}>{task.deliveryDate ? new Date(task.deliveryDate).toLocaleDateString() : 'N/A'}</td>
                        <td style={{ padding: '12px' }}>₹{task.totalPrice || 0}</td>
                        <td style={{ padding: '12px' }}>
                          <span 
                            className="task-status" 
                            style={{ backgroundColor: getTaskStatusColor(task.status), color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '500', textTransform: 'capitalize' }}
                          >
                            {getTaskStatusText(task.status)}
                          </span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button 
                              className="edit-btn" 
                              onClick={() => handleTaskClick(task)}
                              title="View"
                            >
                              <FiEye />
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
                <p>No tasks found</p>
                <div style={{ marginTop: '16px' }}>
                  <button className="add-btn" onClick={() => navigate('/orders')}>
                    <FiPlus /> Create Order to Generate Tasks
                  </button>
                </div>
              </div>
            )}
        </div>

        {/* Task Detail Modal */}
        {showTaskDetail && selectedTask && (
          <div className="modal-overlay" onClick={() => setShowTaskDetail(false)}>
            <div className="modal-content task-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
              <div className="modal-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, color: 'var(--primary-dark)', fontSize: '24px' }}>Task Details</h2>
                <button className="close-btn" onClick={() => setShowTaskDetail(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--gray-color)' }}>×</button>
              </div>
              
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* Task Status & Basic Info */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', padding: '16px', background: 'var(--background-light)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  {/* <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '600', color: 'var(--gray-color)' }}>Order ID:</span>
                    <span style={{ fontWeight: '500', color: 'var(--primary-dark)' }}>{selectedTask._id?.slice(-8) || 'N/A'}</span>
                  </div> */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '600', color: 'var(--gray-color)' }}>Status:</span>
                    <span 
                      style={{ 
                        backgroundColor: getTaskStatusColor(selectedTask.status), 
                        color: 'white', 
                        padding: '4px 12px', 
                        borderRadius: '12px', 
                        fontSize: '12px', 
                        fontWeight: '500', 
                        textTransform: 'capitalize' 
                      }}
                    >
                      {getTaskStatusText(selectedTask.status)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '600', color: 'var(--gray-color)' }}>Created:</span>
                    <span style={{ fontWeight: '500', color: 'var(--primary-dark)' }}>{selectedTask.createdAt ? new Date(selectedTask.createdAt).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '600', color: 'var(--gray-color)' }}>Delivery Date:</span>
                    <span style={{ fontWeight: '500', color: 'var(--primary-dark)' }}>{selectedTask.deliveryDate ? new Date(selectedTask.deliveryDate).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>

                {/* Customer Information */}
                <div style={{ padding: '16px', background: 'white', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <h3 style={{ margin: '0 0 16px 0', color: 'var(--primary-dark)', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '4px', height: '20px', background: 'var(--primary-color)', borderRadius: '2px' }}></span>
                    Customer Information
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: 'var(--gray-color)', marginBottom: '4px', fontWeight: '600' }}>Name</label>
                      <span style={{ display: 'block', fontSize: '14px', color: 'var(--primary-dark)', fontWeight: '500' }}>{selectedTask.customerId?.fullName || 'N/A'}</span>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: 'var(--gray-color)', marginBottom: '4px', fontWeight: '600' }}>Mobile</label>
                      <span style={{ display: 'block', fontSize: '14px', color: 'var(--primary-dark)', fontWeight: '500' }}>{selectedTask.customerId?.mobile || 'N/A'}</span>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontSize: '12px', color: 'var(--gray-color)', marginBottom: '4px', fontWeight: '600' }}>Address</label>
                      <span style={{ display: 'block', fontSize: '14px', color: 'var(--primary-dark)', fontWeight: '500' }}>{selectedTask.customerId?.address || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Product Information */}
                <div style={{ padding: '16px', background: 'white', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <h3 style={{ margin: '0 0 16px 0', color: 'var(--primary-dark)', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '4px', height: '20px', background: 'var(--primary-color)', borderRadius: '2px' }}></span>
                    Product Information
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: 'var(--gray-color)', marginBottom: '4px', fontWeight: '600' }}>Product Name</label>
                      <span style={{ display: 'block', fontSize: '14px', color: 'var(--primary-dark)', fontWeight: '500' }}>{selectedTask.productName || 'N/A'}</span>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: 'var(--gray-color)', marginBottom: '4px', fontWeight: '600' }}>Outfit Type</label>
                      <span style={{ display: 'block', fontSize: '14px', color: 'var(--primary-dark)', fontWeight: '500' }}>{selectedTask.outfitTypeName || 'N/A'}</span>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: 'var(--gray-color)', marginBottom: '4px', fontWeight: '600' }}>Assigned Worker</label>
                      <span style={{ display: 'block', fontSize: '14px', color: 'var(--primary-dark)', fontWeight: '500' }}>{selectedTask.assignWorker?.fullName || 'Not assigned'}</span>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: 'var(--gray-color)', marginBottom: '4px', fontWeight: '600' }}>Total Days</label>
                      <span style={{ display: 'block', fontSize: '14px', color: 'var(--primary-dark)', fontWeight: '500' }}>{selectedTask.totalDays || 0} days</span>
                    </div>
                  </div>
                </div>

                {/* Pricing Information */}
                <div style={{ padding: '16px', background: 'var(--background-light)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <h3 style={{ margin: '0 0 16px 0', color: 'var(--primary-dark)', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '4px', height: '20px', background: 'var(--success-color)', borderRadius: '2px' }}></span>
                    Pricing Information
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
                    <div style={{ textAlign: 'center', padding: '12px', background: 'white', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <div style={{ fontSize: '12px', color: 'var(--gray-color)', marginBottom: '4px', fontWeight: '600' }}>Total Price</div>
                      <div style={{ fontSize: '20px', color: 'var(--primary-dark)', fontWeight: '700' }}>₹{selectedTask.totalPrice || 0}</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '12px', background: 'white', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <div style={{ fontSize: '12px', color: 'var(--gray-color)', marginBottom: '4px', fontWeight: '600' }}>Advance Amount</div>
                      <div style={{ fontSize: '20px', color: 'var(--primary-dark)', fontWeight: '700' }}>₹{selectedTask.advanceAmount || 0}</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '12px', background: 'white', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <div style={{ fontSize: '12px', color: 'var(--gray-color)', marginBottom: '4px', fontWeight: '600' }}>Balance</div>
                      <div style={{ fontSize: '20px', color: 'var(--primary-dark)', fontWeight: '700' }}>₹{(selectedTask.totalPrice || 0) - (selectedTask.advanceAmount || 0)}</div>
                    </div>
                  </div>
                </div>

                {/* Measurements */}
                {selectedTask.measurement && selectedTask.measurement.length > 0 && (
                  <div style={{ padding: '16px', background: 'white', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <h3 style={{ margin: '0 0 16px 0', color: 'var(--primary-dark)', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '4px', height: '20px', background: 'var(--info-color)', borderRadius: '2px' }}></span>
                      Measurements
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                      {selectedTask.measurement.map((measurement, index) => (
                        <div key={index} style={{ padding: '8px 12px', background: 'var(--background-light)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                          <div style={{ fontSize: '12px', color: 'var(--gray-color)', marginBottom: '2px', fontWeight: '600' }}>{measurement.fieldLable || measurement.fieldLabel}</div>
                          <div style={{ fontSize: '14px', color: 'var(--primary-dark)', fontWeight: '500' }}>{measurement.fieldValue} {measurement.unit || ''}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Addons */}
                {selectedTask.addons && selectedTask.addons.length > 0 && (
                  <div style={{ padding: '16px', background: 'white', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <h3 style={{ margin: '0 0 16px 0', color: 'var(--primary-dark)', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '4px', height: '20px', background: 'var(--warning-color)', borderRadius: '2px' }}></span>
                      Addons
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {selectedTask.addons.map((addon, index) => (
                        <div key={index} style={{ padding: '6px 12px', background: 'var(--background-light)', borderRadius: '16px', border: '1px solid var(--border-color)', fontSize: '13px' }}>
                          <span style={{ fontWeight: '600', color: 'var(--gray-color)' }}>{addon.title}:</span>
                          <span style={{ marginLeft: '4px', color: 'var(--primary-dark)', fontWeight: '500' }}>{addon.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Outfit Style Reference Images */}
                {selectedTask.outfitStyleRefImg && selectedTask.outfitStyleRefImg.length > 0 && (
                  <div style={{ padding: '16px', background: 'white', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <h3 style={{ margin: '0 0 16px 0', color: 'var(--primary-dark)', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '4px', height: '20px', background: 'var(--primary-color)', borderRadius: '2px' }}></span>
                      Outfit Style Reference Images
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px' }}>
                      {selectedTask.outfitStyleRefImg.map((img, index) => (
                        <div key={index} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                          <img 
                            src={img} 
                            alt={`Outfit Style ${index + 1}`} 
                            style={{ width: '100%', height: '120px', objectFit: 'cover' }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Work Reference Images - Show only when task is in_progress or paused */}
                {(selectedTask.status === 'in_progress' || selectedTask.status === 'paused') && (
                  <div style={{ padding: '16px', background: 'white', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <h3 style={{ margin: '0 0 16px 0', color: 'var(--primary-dark)', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '4px', height: '20px', background: 'var(--secondary-color)', borderRadius: '2px' }}></span>
                      Work Reference Images
                    </h3>
                    <div style={{ marginBottom: '16px' }}>
                      <input
                        type="file"
                        id="refImageUpload"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                      />
                      <label 
                        htmlFor="refImageUpload" 
                        style={{ 
                          display: 'inline-block', 
                          padding: '8px 16px', 
                          background: 'var(--primary-color)', 
                          color: 'white', 
                          borderRadius: '6px', 
                          cursor: 'pointer', 
                          fontSize: '14px', 
                          fontWeight: '500',
                          border: 'none',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = 'var(--primary-dark)'}
                        onMouseOut={(e) => e.target.style.backgroundColor = 'var(--primary-color)'}
                      >
                        + Upload Reference Images
                      </label>
                    </div>
                    
                    {imagePreviews.length > 0 && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px' }}>
                        {imagePreviews.map((preview, index) => (
                          <div key={index} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                            <img 
                              src={preview} 
                              alt={`Preview ${index + 1}`} 
                              style={{ width: '100%', height: '120px', objectFit: 'cover' }}
                            />
                            <button 
                              onClick={() => removeImage(index)}
                              style={{ 
                                position: 'absolute', 
                                top: '4px', 
                                right: '4px', 
                                background: 'rgba(255, 255, 255, 0.9)', 
                                border: 'none', 
                                borderRadius: '50%', 
                                width: '24px', 
                                height: '24px', 
                                cursor: 'pointer', 
                                fontSize: '16px', 
                                color: 'var(--alert-color)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {imagePreviews.length === 0 && (
                      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-color)', background: 'var(--background-light)', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
                        No reference images uploaded yet
                      </div>
                    )}
                  </div>
                )}

              </div>
              
              <div className="modal-footer" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                {selectedTask.status === 'pending' && (
                  <button 
                    onClick={() => handleStartTask(selectedTask._id)}
                    style={{ 
                      padding: '8px 16px', 
                      background: 'var(--success-color)', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '6px', 
                      cursor: 'pointer', 
                      fontSize: '14px', 
                      fontWeight: '500',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#218838'}
                    onMouseOut={(e) => e.target.style.backgroundColor = 'var(--success-color)'}
                  >
                    Start Task
                  </button>
                )}
                {selectedTask.status === 'start' && (
                  <button 
                    onClick={() => handlePauseTask(selectedTask._id)}
                    style={{ 
                      padding: '8px 16px', 
                      background: 'var(--warn-color)', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '6px', 
                      cursor: 'pointer', 
                      fontSize: '14px', 
                      fontWeight: '500',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#e0a800'}
                    onMouseOut={(e) => e.target.style.backgroundColor = 'var(--warn-color)'}
                  >
                    Pause Task
                  </button>
                )}
                {(selectedTask.status === 'start' || selectedTask.status === 'paused') && (
                  <button 
                    onClick={() => handleEndTask(selectedTask._id)}
                    style={{ 
                      padding: '8px 16px', 
                      background: 'var(--primary-color)', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '6px', 
                      cursor: 'pointer', 
                      fontSize: '14px', 
                      fontWeight: '500',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = 'var(--primary-dark)'}
                    onMouseOut={(e) => e.target.style.backgroundColor = 'var(--primary-color)'}
                  >
                    End Task
                  </button>
                )}
                <button 
                  onClick={() => setShowTaskDetail(false)}
                  style={{ 
                    padding: '8px 16px', 
                    background: 'var(--gray-color)', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '6px', 
                    cursor: 'pointer', 
                    fontSize: '14px', 
                    fontWeight: '500',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#5a6268'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'var(--gray-color)'}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tasks;
