import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar.js';
import '../styles.css';
import { storage } from '../utils/storage';
import { taskAPI } from '../services/api';

const Tasks = ({ onLogout }) => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
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
      const tasksData = await taskAPI.getTasks(search);
      setTasks(tasksData || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      alert('Failed to fetch tasks: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTasks();
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
          <div className="section-header">
            <h2 className="section-title">Tasks</h2>
            <form onSubmit={handleSearchSubmit} className="search-form">
              <input
                type="text"
                placeholder="Search tasks..."
                value={search}
                onChange={handleSearch}
                className="search-input"
              />
              <button type="submit" className="search-btn">Search</button>
            </form>
          </div>

          <div className="tasks-list">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>Loading tasks...</div>
            ) : tasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-color)' }}>
                No tasks found
                <div style={{ marginTop: '16px' }}>
                  <button className="add-btn" onClick={() => navigate('/orders')}>
                    + Create Order to Generate Tasks
                  </button>
                </div>
              </div>
            ) : (
              <div className="tasks-table-container">
                <table className="tasks-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Product</th>
                      <th>Outfit Type</th>
                      <th>Assigned To</th>
                      <th>Delivery Date</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((task) => (
                      <tr key={task._id}>
                        <td className="order-id">{task._id}</td>
                        <td>{task.customerId?.fullName || 'N/A'}</td>
                        <td>{task.productName || 'N/A'}</td>
                        <td>{task.outfitTypeName || 'N/A'}</td>
                        <td>{task.assignWorker?.fullName || 'Not assigned'}</td>
                        <td>{task.deliveryDate ? new Date(task.deliveryDate).toLocaleDateString() : 'N/A'}</td>
                        <td>₹{task.totalPrice || 0}</td>
                        <td>
                          <span 
                            className="task-status" 
                            style={{ backgroundColor: getTaskStatusColor(task.status) }}
                          >
                            {getTaskStatusText(task.status)}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="view-btn" 
                            onClick={() => handleTaskClick(task)}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Task Detail Modal */}
        {showTaskDetail && selectedTask && (
          <div className="modal-overlay" onClick={() => setShowTaskDetail(false)}>
            <div className="modal-content task-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Task Details</h2>
                <button className="close-btn" onClick={() => setShowTaskDetail(false)}>×</button>
              </div>
              <div className="modal-body">
                <div className="task-modal-grid">
                  {/* Left Column - Order Information */}
                  <div className="task-modal-left">
                    <div className="task-detail-section">
                      <h3>Order Information</h3>
                      <div className="detail-grid">
                        <div className="detail-item">
                          <label>Order ID:</label>
                          <span>{selectedTask._id}</span>
                        </div>
                        <div className="detail-item">
                          <label>Status:</label>
                          <span 
                            className="task-status" 
                            style={{ backgroundColor: getTaskStatusColor(selectedTask.status) }}
                          >
                            {getTaskStatusText(selectedTask.status)}
                          </span>
                        </div>
                        <div className="detail-item">
                          <label>Customer:</label>
                          <span>{selectedTask.customerId?.fullName || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                          <label>Mobile:</label>
                          <span>{selectedTask.customerId?.mobile || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                          <label>Address:</label>
                          <span>{selectedTask.customerId?.address || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                          <label>Product:</label>
                          <span>{selectedTask.productName || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                          <label>Outfit Type:</label>
                          <span>{selectedTask.outfitTypeName || 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                          <label>Assigned To:</label>
                          <span>{selectedTask.assignWorker?.fullName || 'Not assigned'}</span>
                        </div>
                        <div className="detail-item">
                          <label>Delivery Date:</label>
                          <span>{selectedTask.deliveryDate ? new Date(selectedTask.deliveryDate).toLocaleDateString() : 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                          <label>Total Price:</label>
                          <span>₹{selectedTask.totalPrice || 0}</span>
                        </div>
                        <div className="detail-item">
                          <label>Advance Amount:</label>
                          <span>₹{selectedTask.advanceAmount || 0}</span>
                        </div>
                        <div className="detail-item">
                          <label>Total Days:</label>
                          <span>{selectedTask.totalDays || 0} days</span>
                        </div>
                        <div className="detail-item">
                          <label>Created:</label>
                          <span>{selectedTask.createdAt ? new Date(selectedTask.createdAt).toLocaleString() : 'N/A'}</span>
                        </div>
                        <div className="detail-item">
                          <label>Updated:</label>
                          <span>{selectedTask.updatedAt ? new Date(selectedTask.updatedAt).toLocaleString() : 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Measurements, Addons, Images */}
                  <div className="task-modal-right">
                    {/* Measurements Section */}
                    {selectedTask.measurement && selectedTask.measurement.length > 0 && (
                      <div className="task-detail-section">
                        <h3>Measurements</h3>
                        <div className="measurements-grid">
                          {selectedTask.measurement.map((measurement, index) => (
                            <div key={index} className="measurement-item">
                              <span className="measurement-label">{measurement.fieldLable}:</span>
                              <span className="measurement-value">{measurement.fieldValue} {measurement.unit}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Addons Section */}
                    {selectedTask.addons && selectedTask.addons.length > 0 && (
                      <div className="task-detail-section">
                        <h3>Addons</h3>
                        <div className="addons-list">
                          {selectedTask.addons.map((addon, index) => (
                            <div key={index} className="addon-item">
                              <span className="addon-title">{addon.title}:</span>
                              <span className="addon-value">{addon.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Outfit Style Reference Images */}
                    {selectedTask.outfitStyleRefImg && selectedTask.outfitStyleRefImg.length > 0 && (
                      <div className="task-detail-section">
                        <h3>Outfit Style Reference Images</h3>
                        <div className="ref-images-grid">
                          {selectedTask.outfitStyleRefImg.map((img, index) => (
                            <div key={index} className="ref-image-item">
                              <img src={img} alt={`Outfit Style ${index + 1}`} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Reference Images Section */}
                <div className="task-detail-section">
                  <h3>Work Reference Images</h3>
                  <div className="image-upload-section">
                    <input
                      type="file"
                      id="refImageUpload"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="refImageUpload" className="upload-btn">
                      + Upload Reference Images
                    </label>
                  </div>
                  
                  {imagePreviews.length > 0 && (
                    <div className="image-preview-grid">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="image-preview-item">
                          <img src={preview} alt={`Preview ${index + 1}`} />
                          <button 
                            className="remove-image-btn" 
                            onClick={() => removeImage(index)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <div className="task-actions">
                  {selectedTask.status === 'pending' && (
                    <button 
                      className="start-btn" 
                      onClick={() => handleStartTask(selectedTask._id)}
                    >
                      Start Task
                    </button>
                  )}
                  {selectedTask.status === 'in_progress' && (
                    <button 
                      className="pause-btn" 
                      onClick={() => handlePauseTask(selectedTask._id)}
                    >
                      Pause Task
                    </button>
                  )}
                  {selectedTask.status === 'paused' && (
                    <button 
                      className="start-btn" 
                      onClick={() => handleStartTask(selectedTask._id)}
                    >
                      Resume Task
                    </button>
                  )}
                  {(selectedTask.status === 'in_progress' || selectedTask.status === 'paused') && (
                    <button 
                      className="end-btn" 
                      onClick={() => handleEndTask(selectedTask._id)}
                    >
                      End Task
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tasks;
