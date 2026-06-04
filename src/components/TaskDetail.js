import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from './Sidebar.js';
import '../styles.css';
import { storage } from '../utils/storage';
import { taskAPI } from '../services/api';
import { FiEye, FiEdit, FiCalendar, FiPlay, FiPause, FiCheckCircle } from 'react-icons/fi';
import Pagination from './Pagination.js';

const TaskDetail = ({ onLogout }) => {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const { orderId } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchTasks();
    }, [orderId]);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await taskAPI.getTaskById(orderId);
            const tasksData = Array.isArray(response?.taskDetails)
                ? response.taskDetails
                : [];
            setTasks(tasksData);
        } catch (error) {
            console.error('Error fetching task details:', error);
            setError(error.message || 'Failed to fetch task details');
        } finally {
            setLoading(false);
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

    const pendingTasks = tasks.filter((task) => task.status === 'pending');
    const inProgressTasks = tasks.filter((task) => ['started', 'paused'].includes(task.status));
    const completedTasks = tasks.filter((task) => task.status === 'completed');

    const renderTaskCard = (task) => (
        <div className="task-card" key={task._id}>
            <div className="task-title">
                <div>
                    {/* <strong>{task.orderId}</strong> */}
                    <strong>{task.orderId.slice(-6)}</strong>
                    {/* <div style={{ fontSize: '13px', color: '#555', marginTop: '4px' }}>
                        {task.customerId || task.outfitTypeName || 'Task details'}
                    </div> */}
                </div>
                <div className="task-actions">
                    {task.status === 'pending' || task.status === 'paused' &&  (
                        <div className="task_view-btn start" title="Start Task">
                            <FiPlay />
                        </div>
                    )}
                    {task.status === 'started' && (
                        <div className="task_view-btn pause" title="Pause Task">
                            <FiPause />
                        </div>
                    )}
                    {task.status !== 'completed' && (
                        <div className="task_view-btn complete" title="Complete Task">
                            <FiCheckCircle />
                        </div>
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
                <div className="content-section task_details_div kanban-board">
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
                            <div className="task_group">
                                <div className="task_group_heading">
                                    <p>To Do</p> <span className="task_count">{pendingTasks.length}</span>
                                </div>
                                {pendingTasks.length > 0 ? pendingTasks.map(renderTaskCard) : (
                                    <div style={{ padding: '16px', color: 'var(--gray-color)' }}>
                                        No pending tasks
                                    </div>
                                )}
                            </div>
                            <div className="task_group">
                                <div className="task_group_heading">
                                    <p>In Progress</p> <span className="task_count">{inProgressTasks.length}</span>
                                </div>
                                {inProgressTasks.length > 0 ? inProgressTasks.map(renderTaskCard) : (
                                    <div style={{ padding: '16px', color: 'var(--gray-color)' }}>
                                        No tasks in progress
                                    </div>
                                )}
                            </div>
                            <div className="task_group">
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
            </div>
        </div>
    );
};

export default TaskDetail;
