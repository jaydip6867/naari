import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar.js';
import '../styles.css';
import { storage } from '../utils/storage';
import { taskAPI } from '../services/api';
import { FiPlus, FiSearch, FiEye, FiEdit, FiCalendar } from 'react-icons/fi';

const Tasks = ({ onLogout }) => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]); // Store all tasks for filtering
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [selectedTaskLoading, setSelectedTaskLoading] = useState(false);

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

  const loadTaskDetails = async (taskId) => {
    try {
      const response = await taskAPI.getTaskById(taskId);
      return response || null;
    } catch (error) {
      console.error('Error loading task details:', error);
      throw error;
    }
  };

  const handleTaskClick = async (task) => {
    try {
      setSelectedTaskLoading(true);
      setError('');
      const taskDetails = await loadTaskDetails(task._id);
      setSelectedTask(taskDetails || task);
      setShowTaskDetail(true);
    } catch (error) {
      setError(error.message || 'Failed to load task details');
    } finally {
      setSelectedTaskLoading(false);
    }
  };



  const normalizeStatus = (status) => {
    if (!status) return 'unknown';
    const normalized = status.toString().toLowerCase();
    if (normalized === 'start' || normalized === 'started' || normalized === 'in_progress') return 'started';
    if (normalized === 'pause' || normalized === 'paused') return 'paused';
    if (normalized === 'end' || normalized === 'ended' || normalized === 'completed') return 'ended';
    if (normalized === 'pending' || normalized === 'created' || normalized === 'not_started') return 'pending';
    return normalized;
  };

  const getTaskStatusColor = (status) => {
    switch (normalizeStatus(status)) {
      case 'pending': return '#ffc107';
      case 'started': return '#28a745';
      case 'paused': return '#fd7e14';
      case 'ended': return '#007bff';
      default: return '#6c757d';
    }
  };

  const getTaskStatusText = (status) => {
    switch (normalizeStatus(status)) {
      case 'pending': return 'Pending';
      case 'started': return 'Started';
      case 'paused': return 'Paused';
      case 'ended': return 'Ended';
      default: return 'Unknown';
    }
  };

  const getDetailTaskStatus = (task) => {
    if (!task) return null;
    return task.taskDetails?.[0]?.status || task.status || null;
  };

  const getTaskCardTitle = (task) => {
    if (task.orderId) return task.orderId;
    // if (task.productName) return task.productName;
    return 'No Order ID';
  };

  const formatTaskDate = (task) => {
    const dateValue = task.deliveryDate || task.createdAt;
    return dateValue ? new Date(dateValue).toLocaleDateString() : 'No date';
  };

  const getAssignWorkerStatuses = (task) => {
    if (!task) return [];
    if (Array.isArray(task.assignWorker)) {
      return task.assignWorker.map((item) => item?.status).filter(Boolean);
    }
    if (task.assignWorker?.status) {
      return [task.assignWorker.status];
    }
    return [];
  };

  const statusColors = {
    FABRIC_PURCHASE: {
      backgroundColor: "#fef2f2",
      color: "#dc2626",
    },
    DYING: {
      backgroundColor: "#fff7ed",
      color: "#ea580c",
    },
    FUSING: {
      backgroundColor: "#fefce8",
      color: "#a16207",
    },
    KHAKHA: {
      backgroundColor: "#f0fdf4",
      color: "#15803d",
    },
    ARTWORK: {
      backgroundColor: "#f0f9ff",
      color: "#0284c7",
    },
    ADDONS: {
      backgroundColor: "#eff6ff",
      color: "#2563eb",
    },
    CUTTING: {
      backgroundColor: "#faf5ff",
      color: "#9333ea",
    },
    STITCHING: {
      backgroundColor: "#fdf2f8",
      color: "#db2777",
    },
    QC: {
      backgroundColor: "#f3f4f6",
      color: "#374151",
    },
    OTHER_WORK: {
      backgroundColor: "#f5f3ff",
      color: "#7e22ce",
    },
    PACKING: {
      backgroundColor: "#ecfeff",
      color: "#0369a1",
    },
    READY_TO_DELIVERY: {
      backgroundColor: "#fefce8",
      color: "#a16207",
    },
    DELIVERY_COMPLETE: {
      backgroundColor: "#dcfce7",
      color: "#166534",
    },
    REPAIRING: {
      backgroundColor: "#fef2f2",
      color: "#b91c1c",
    },
  };

  const getStatusStyle = (status) => {
    const key = status?.toUpperCase().replace(/\s+/g, "_");
    return (
      statusColors[key] || {
        backgroundColor: "#f3f4f6",
        color: "#374151",
      }
    );
  };

  const isPendingStatus = (status) => ['pending', 'created', 'not_started'].includes(status?.toString().toLowerCase());
  const isStartedStatus = (status) => ['start', 'started', 'in_progress'].includes(status?.toString().toLowerCase());
  const isPausedStatus = (status) => ['pause', 'paused'].includes(status?.toString().toLowerCase());
  const isEndedStatus = (status) => ['end', 'ended', 'completed'].includes(status?.toString().toLowerCase());

  const todoTasks = tasks.filter((task) => {
    const status = getDetailTaskStatus(task);
    return !status || isPendingStatus(status);
  });

  const inProgressTasks = tasks.filter((task) => {
    const status = getDetailTaskStatus(task);
    return isStartedStatus(status) || isPausedStatus(status);
  });

  const completedTasks = tasks.filter((task) => {
    const status = getDetailTaskStatus(task);
    return isEndedStatus(status);
  });

  const handleLogout = () => {
    storage.clearAuthData();
    onLogout();
    navigate('/');
  };

  const selectedTaskDetailStatus = getDetailTaskStatus(selectedTask);

  return (
    <div className="settings-container">
      {/* Sidebar */}
      <Sidebar onLogout={handleLogout} />

      {/* Main Content */}
      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">Task Management</h1>
        </div>

        <div className="content-section pt-0">
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

          <div className="section-header pt-3">
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
            <div className="kanban-board">
              <div className="task_group">
                <div className="task_group_heading">
                  <p>Todo</p> <span className="task_count">{todoTasks.length}</span>
                </div>
                <div>
                  {todoTasks.length > 0 ? todoTasks.map((task) => (
                    <div className="task-card" key={task._id}>
                      <div className="task-title">
                        {getTaskCardTitle(task)}
                        <div className="task-actions">
                          <div className="task_view-btn" onClick={() => handleTaskClick(task)} title="View Task">
                            <FiEye />
                          </div>
                          <div className="task_view-btn" onClick={() => navigate(`/tasks/${task._id}`)} title="Edit Task">
                            <FiEdit />
                          </div>
                        </div>
                      </div>
                      <div className="task-date">
                        <FiCalendar /> <span>{formatTaskDate(task)}</span>
                      </div>
                      <div className="bottom-row">
                        {getAssignWorkerStatuses(task).length > 0 ? (
                          getAssignWorkerStatuses(task).map((status, index) => (
                            <div
                              key={index}
                              className="tag"
                              style={getStatusStyle(status)}
                            >
                              {status.replace(/_/g, " ")}
                            </div>
                          ))
                        ) : ""}
                      </div>
                    </div>
                  )) : (
                    <div style={{ padding: '16px', color: 'var(--gray-color)' }}>No pending tasks</div>
                  )}
                </div>
              </div>
              <div className="task_group">
                <div className="task_group_heading">
                  <p>In Progress</p> <span className="task_count">{inProgressTasks.length}</span>
                </div>
                {inProgressTasks.length > 0 ? inProgressTasks.map((task) => (
                  <div className="task-card" key={task._id || `${task.productName}-${Math.random()}`}>
                    <div className="task-title">
                      {getTaskCardTitle(task)}
                      <div className="task-actions">
                        <div className="task_view-btn" onClick={() => handleTaskClick(task)} title="View Task">
                          <FiEye />
                        </div>
                        <div className="task_view-btn" onClick={() => navigate(`/tasks/${task._id}`)} title="Edit Task">
                          <FiEdit />
                        </div>
                      </div>
                    </div>
                    <div className="task-date">
                      <FiCalendar /> <span>{formatTaskDate(task)}</span>
                    </div>
                    <div className="bottom-row">
                      {getAssignWorkerStatuses(task).length > 0 ? getAssignWorkerStatuses(task).map((status, index) => (
                        <div key={index} className="tag">{status.replace(/_/g, ' ')}</div>
                      )) : (
                        <div className="tag">{task.outfitTypeName || task.productName || 'Artwork'}</div>
                      )}
                    </div>
                  </div>
                )) : (
                  <div style={{ padding: '16px', color: 'var(--gray-color)' }}>No tasks in progress</div>
                )}
              </div>
              <div className="task_group">
                <div className="task_group_heading">
                  <p>Completed</p> <span className="task_count">{completedTasks.length}</span>
                </div>
                {completedTasks.length > 0 ? completedTasks.map((task) => (
                  <div className="task-card" key={task._id || `${task.productName}-${Math.random()}`}>
                    <div className="task-title">
                      {getTaskCardTitle(task)}
                      <div className="task-actions">
                        <div className="task_view-btn" onClick={() => handleTaskClick(task)} title="View Task">
                          <FiEye />
                        </div>
                        <div className="task_view-btn" onClick={() => navigate(`/tasks/${task._id}`)} title="Edit Task">
                          <FiEdit />
                        </div>
                      </div>
                    </div>
                    <div className="task-date">
                      <FiCalendar /> <span>{formatTaskDate(task)}</span>
                    </div>
                    <div className="bottom-row">
                      {getAssignWorkerStatuses(task).length > 0 ? getAssignWorkerStatuses(task).map((status, index) => (
                        <div key={index} className="tag">{status.replace(/_/g, ' ')}</div>
                      )) : (
                        <div className="tag">{task.outfitTypeName || task.productName || 'Artwork'}</div>
                      )}
                    </div>
                  </div>
                )) : (
                  <div style={{ padding: '16px', color: 'var(--gray-color)' }}>No completed tasks</div>
                )}
              </div>
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
                        backgroundColor: getTaskStatusColor(selectedTaskDetailStatus),
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        textTransform: 'capitalize'
                      }}
                    >
                      {getTaskStatusText(selectedTaskDetailStatus)}
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
                      <span style={{ display: 'block', fontSize: '14px', color: 'var(--primary-dark)', fontWeight: '500', wordBreak: 'break-word' }}>{selectedTask.customerId?.address || 'N/A'}</span>
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


              </div>

              <div className="modal-footer" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
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
