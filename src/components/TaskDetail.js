import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from './Sidebar.js';
import '../styles.css';
import { storage } from '../utils/storage';
import { taskAPI, uploadAPI } from '../services/api';
import { FiEye, FiEdit, FiCalendar, FiPlay, FiPause, FiCheckCircle, FiUploadCloud } from 'react-icons/fi';
import Pagination from './Pagination.js';

const TaskDetail = ({ onLogout }) => {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [taskData, setTaskData] = useState(null);
    const [showEndTaskModal, setShowEndTaskModal] = useState(false);
    const [refImages, setRefImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [isUploadingImages, setIsUploadingImages] = useState(false);
    const [isTaskActionLoading, setIsTaskActionLoading] = useState(false);
    const [isEndingTask, setIsEndingTask] = useState(false);
    const { orderId } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const currentUser = storage.getUser();
    const isAdminUser = currentUser?.type === 'admin' ||
        currentUser?.roleid?.name?.toLowerCase().includes('admin') ||
        currentUser?.fullName === 'Admin';

    useEffect(() => {
        fetchTasks();
    }, [orderId]);

    const getWorkerId = (workerId) => {
        if (!workerId) return '';
        if (typeof workerId === 'string') return workerId;
        return workerId._id || workerId.id || '';
    };

    const normalizeStatus = (status) => {
        if (!status) return '';
        const value = String(status).trim().toLowerCase();
        if (value.includes('todo')) return 'todo';
        if (value.includes('pending')) return 'pending';
        if (value.includes('completed') || value.includes('complete')) return 'completed';
        if (value.includes('started')) return 'started';
        if (value.includes('paused')) return 'paused';
        return value;
    };

    // const mergeTaskData = (data) => {
    //     const allAssignWorker = Array.isArray(data?.assignWorker) ? data.assignWorker : [];
    //     const allTaskDetails = Array.isArray(data?.taskDetails) ? data.taskDetails : [];
    //     const currentUserId = currentUser?._id || currentUser?.id || currentUser?.userId || '';

    //     const assignWorker = isAdminUser
    //         ? allAssignWorker
    //         : allAssignWorker.filter((assignment) => getWorkerId(assignment.workerId) === currentUserId);

    //     const taskDetails = isAdminUser
    //         ? allTaskDetails
    //         : allTaskDetails.filter((detail) => getWorkerId(detail.workerId) === currentUserId);

    //     if (taskDetails.length === 0) {
    //         return assignWorker.map((assignment, index) => ({
    //             uid: `assign-${getWorkerId(assignment.workerId)}-${index}`,
    //             ...assignment,
    //             orderId: data?.orderId || '',
    //             status: 'todo',
    //             description: assignment.description || '',
    //             workerId: assignment.workerId,
    //             createdAt: data?.createdAt,
    //             deliveryDate: data?.deliveryDate,
    //         }));
    //     }

    //     const assignmentMap = assignWorker.reduce((map, assignment) => {
    //         const id = getWorkerId(assignment.workerId);
    //         if (!id) return map;
    //         if (!map[id]) map[id] = [];
    //         map[id].push(assignment);
    //         return map;
    //     }, {});

    //     const taskDetailsMap = taskDetails.reduce((map, detail) => {
    //         const id = getWorkerId(detail.workerId);
    //         if (!id) return map;
    //         if (!map[id]) map[id] = [];
    //         map[id].push(detail);
    //         return map;
    //     }, {});

    //     const merged = [];

    //     taskDetails.forEach((detail, index) => {
    //         const workerId = getWorkerId(detail.workerId);
    //         const assignment = (assignmentMap[workerId] && assignmentMap[workerId][0]) || {};
    //         merged.push({
    //             uid: detail._id || `task-${workerId}-${index}`,
    //             ...assignment,
    //             ...detail,
    //             workerId: detail.workerId || assignment.workerId,
    //             description: assignment.description ?? detail.description ?? '',
    //             status: normalizeStatus(detail.status) || normalizeStatus(assignment.status),
    //         });
    //     });

    //     if (isAdminUser) {
    //         assignWorker.forEach((assignment, index) => {
    //             const workerId = getWorkerId(assignment.workerId);
    //             if (!taskDetailsMap[workerId] || taskDetailsMap[workerId].length === 0) {
    //                 merged.push({
    //                     uid: `assign-${workerId}-${index}`,
    //                     ...assignment,
    //                     orderId: data?.orderId || '',
    //                     status: 'todo',
    //                     description: assignment.description || '',
    //                     workerId: assignment.workerId,
    //                     createdAt: data?.createdAt,
    //                     deliveryDate: data?.deliveryDate,
    //                 });
    //             }
    //         });
    //     }

    //     return merged;
    // };

    const mergeTaskData = (data) => {
        const allAssignWorker = Array.isArray(data?.assignWorker)
            ? data.assignWorker
            : [];

        const allTaskDetails = Array.isArray(data?.taskDetails)
            ? data.taskDetails
            : [];

        const currentUserId =
            currentUser?._id ||
            currentUser?.id ||
            currentUser?.userId ||
            '';

        const assignWorker = isAdminUser
            ? allAssignWorker
            : allAssignWorker.filter(
                item => getWorkerId(item.workerId) === currentUserId
            );

        const taskDetails = isAdminUser
            ? allTaskDetails
            : allTaskDetails.filter(
                item => getWorkerId(item.workerId) === currentUserId
            );

        return assignWorker.map((assignment, index) => {
            const detail = taskDetails[index];

            return {
                uid: detail?._id || `assign-${index}`,
                workerId: assignment.workerId,
                description: assignment.description || '',
                orderId: data.orderId,
                createdAt: data.createdAt,
                deliveryDate: data.deliveryDate,

                status: detail
                    ? normalizeStatus(detail.status)
                    : 'todo',

                taskDetailId: detail?._id || null,
            };
        });
    };
    const fetchTasks = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await taskAPI.getTaskById(orderId);
            const mergedTasks = mergeTaskData(response);
            setTaskData(response);
            setTasks(mergedTasks);
        } catch (error) {
            console.error('Error fetching task details:', error);
            setError(error.message || 'Failed to fetch task details');
        } finally {
            setLoading(false);
        }
    };

    const handleStartTask = async () => {
        try {
            setIsTaskActionLoading(true);
            setError('');
            await taskAPI.startTask(orderId);
            alert('Task started successfully');
            await fetchTasks();
        } catch (error) {
            console.error('Error starting task:', error);
            setError(error.message || 'Failed to start task');
        } finally {
            setIsTaskActionLoading(false);
        }
    };

    const handlePauseTask = async () => {
        try {
            setIsTaskActionLoading(true);
            setError('');
            await taskAPI.pauseTask(orderId);
            alert('Task paused successfully');
            await fetchTasks();
        } catch (error) {
            console.error('Error pausing task:', error);
            setError(error.message || 'Failed to pause task');
        } finally {
            setIsTaskActionLoading(false);
        }
    };

    const openEndTaskModal = () => {
        setShowEndTaskModal(true);
        setError('');
    };

    const closeEndTaskModal = () => {
        setShowEndTaskModal(false);
        setRefImages([]);
        setImagePreviews([]);
        setIsUploadingImages(false);
        setError('');
    };

    const handleImageUpload = async (event) => {
        const files = Array.from(event.target.files || []);
        if (files.length === 0) return;

        setIsUploadingImages(true);
        const previewUrls = files.map((file) => URL.createObjectURL(file));
        setImagePreviews((prev) => [...prev, ...previewUrls]);

        try {
            const uploadResponse = await uploadAPI.uploadMultipleImages(files);
            const uploadedUrls = Array.isArray(uploadResponse)
                ? uploadResponse
                : uploadResponse?.urls || [];

            if (uploadedUrls.length > 0) {
                setRefImages((prev) => [...prev, ...uploadedUrls]);
            }
        } catch (error) {
            console.error('Error uploading images:', error);
            setError(error.message || 'Failed to upload images');
        } finally {
            setIsUploadingImages(false);
        }
    };

    const removeImage = (index) => {
        setImagePreviews((prev) => prev.filter((_, i) => i !== index));
        setRefImages((prev) => prev.filter((_, i) => i !== index));
    };

    const handleEndTask = async () => {
        if (refImages.length === 0) {
            setError('Please upload at least one reference image to end the task.');
            return;
        }

        try {
            setIsEndingTask(true);
            setError('');
            await taskAPI.endTask(orderId, refImages);
            alert('Task ended successfully');
            closeEndTaskModal();
            await fetchTasks();
        } catch (error) {
            console.error('Error ending task:', error);
            setError(error.message || 'Failed to end task');
        } finally {
            setIsEndingTask(false);
        }
    };

    const handleLogout = () => {
        storage.clearAuthData();
        onLogout();
        navigate('/');
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'No date';
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) return 'No date';
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
        });
    };

    const getTaskTags = (task) => {
        if (task.description) return [task.description];
        const assignStatuses = Array.isArray(task.assignWorker)
            ? task.assignWorker
                .map((item) => item.status)
                .filter(Boolean)
            : [];
        if (assignStatuses.length > 0) return assignStatuses;
        if (Array.isArray(task.workTypes) && task.workTypes.length > 0) return task.workTypes;
        if (task.outfitTypeName) return [task.outfitTypeName];
        return ['Task'];
    };

    const isTodo = (status) => normalizeStatus(status) === 'todo';
    const isPending = (status) => ['pending', 'started', 'paused'].includes(normalizeStatus(status));
    const isCompleted = (status) => normalizeStatus(status) === 'completed';

    const todoTasks = tasks.filter((task) => isTodo(task.status));
    const inPendingTasks = tasks.filter((task) => isPending(task.status));
    const completedTasks = tasks.filter((task) => isCompleted(task.status));
    // console.log(todoTasks, inPendingTasks, completedTasks);
    const renderTaskCard = (task, index) => (
        <div className="task-card" key={task.uid || task._id || index}>
            <div className="task-title">
                <div>
                    <strong>{task.description || task.orderId || 'No description'}</strong>
                    {/* <div style={{ fontSize: '13px', color: '#555', marginTop: '4px' }}>
                        {task.workerId?.fullName || task.workerId || task.orderId || 'Worker'}
                    </div> */}
                </div>
                <div className="task-actions">

                    {/* START BUTTON (pending, paused OR any unknown status) */}
                    {(task.status !== 'started' && task.status !== 'completed') && (
                        <button
                            type="button"
                            className="task_view-btn start"
                            onClick={handleStartTask}
                            disabled={isTaskActionLoading || isAdminUser}
                            title={isAdminUser ? 'Admin users cannot start tasks' : 'Start Task'}
                        >
                            <FiPlay />
                        </button>
                    )}

                    {/* PAUSE BUTTON (only when started) */}
                    {task.status === 'started' && (
                        <button
                            type="button"
                            className="task_view-btn pause"
                            onClick={handlePauseTask}
                            disabled={isTaskActionLoading || isAdminUser}
                            title={isAdminUser ? 'Admin users cannot pause tasks' : 'Pause Task'}
                        >
                            <FiPause />
                        </button>
                    )}

                    {/* COMPLETE BUTTON (only hide when completed) */}
                    {(task.status === 'started' || task.status === 'paused') && (
                        <button
                            type="button"
                            className="task_view-btn complete"
                            onClick={openEndTaskModal}
                            disabled={isTaskActionLoading || isUploadingImages || isAdminUser}
                            title={isAdminUser ? 'Admin users cannot end tasks' : 'End Task'}
                        >
                            <FiCheckCircle />
                        </button>
                    )}

                </div>
            </div>
            <div className="task-date">
                <FiCalendar /> <span>{formatDate(task.deliveryDate || task.createdAt)}</span>
            </div>
            <div className="bottom-row">
                {getTaskTags(task).map((tag, index) => (
                    <div className="tag" key={index}>{tag.replace(/_/g, ' ')}</div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="settings-container">
            <Sidebar onLogout={handleLogout} />
            <div className="main-content">
                <div className="page-header section-header">
                    <h1 className="page-title">Task Details</h1>
                </div>
                <div className="content-section task_details_div kanban-board" style={{ paddingTop: '0' }}>
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
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--primary-color)' }}>
                            Loading task details...
                        </div>
                    ) : (
                        <>
                            <div className="task_group" style={{ paddingTop: '12px' }}>
                                <div className="task_group_heading">
                                    <p>To Do</p> <span className="task_count">{todoTasks.length}</span>
                                </div>
                                {todoTasks.length > 0 ? todoTasks.map(renderTaskCard) : (
                                    <div style={{ padding: '16px', color: 'var(--gray-color)' }}>
                                        No Todo tasks
                                    </div>
                                )}
                            </div>
                            <div className="task_group" style={{ paddingTop: '12px' }}>
                                <div className="task_group_heading">
                                    <p>In Pending</p> <span className="task_count">{inPendingTasks.length}</span>
                                </div>
                                {inPendingTasks.length > 0 ? inPendingTasks.map(renderTaskCard) : (
                                    <div style={{ padding: '16px', color: 'var(--gray-color)' }}>
                                        No pending tasks
                                    </div>
                                )}
                            </div>
                            <div className="task_group" style={{ paddingTop: '12px' }}>
                                <div className="task_group_heading">
                                    <p>Completed</p> <span className="task_count">{completedTasks.length}</span>
                                </div>
                                {completedTasks.length > 0 ? completedTasks.map(renderTaskCard) : (
                                    <div style={{ padding: '16px', color: 'var(--gray-color)' }}>
                                        No completed tasks
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
                {showEndTaskModal && (
                    <div className="modal-overlay">
                        <div className="modal small task-modal" role="dialog" aria-modal="true">
                            <div className="modal-header">
                                <h3 className="modal-title">End Task</h3>
                            </div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Reference Images</label>

                                    <label className="upload-box">
                                        <div className="upload-content">
                                            <div className="upload-icon"><FiUploadCloud /></div>
                                            <div className="upload-text">
                                                <strong>Upload Images</strong>
                                                <span>Click or choose multiple files</span>
                                            </div>
                                        </div>

                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleImageUpload}
                                            disabled={isUploadingImages}
                                            hidden
                                        />
                                    </label>
                                </div>
                                {imagePreviews.length > 0 && (
                                    <div className="preview-grid">
                                        {imagePreviews.map((src, index) => (
                                            <div key={index} className="preview-card">
                                                <img src={src} alt={`Preview ${index + 1}`} />

                                                <button
                                                    type="button"
                                                    className="remove-btn"
                                                    onClick={() => removeImage(index)}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {error && (
                                    <div style={{ marginTop: '16px', color: 'var(--alert-color)' }}>
                                        {error}
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-cancel" onClick={closeEndTaskModal} disabled={isEndingTask}>
                                    Cancel
                                </button>
                                <button type="button" className="btn btn-save" onClick={handleEndTask} disabled={isEndingTask || refImages.length === 0}>
                                    {isEndingTask ? 'Ending...' : 'End Task'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TaskDetail;
