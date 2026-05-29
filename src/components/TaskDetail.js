import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar.js';
import '../styles.css';
import { storage } from '../utils/storage';
import { taskAPI } from '../services/api';
import { FiPlus, FiSearch, FiEye, FiEdit, FiCalendar } from 'react-icons/fi';
import Pagination from './Pagination.js';

const Tasks = ({ onLogout }) => {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [allTasks, setAllTasks] = useState([]); // Store all tasks for filtering
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await taskAPI.getTaskById("69d163160513678ca6785f91"); // Fetch all tasks without search
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
                <div className="page-header section-header">
                    <h1 className="page-title">All Task</h1>
                </div>
                <div className='content-section task_details_div' >
                    <div className='task_group'>
                        <div className='task_group_heading'>
                            <p>To Do</p> <span className='task_count'>01</span>
                        </div>
                        <div class="task-card">

                            <div class="task-title">
                                Solve the dribble prioritization issue with the team
                            </div>
                            <div class="task-date">
                                <FiCalendar /> <span>Jan 08,2027</span>
                            </div>
                            <div class="bottom-row">
                                <div class="tag">Artwork</div>
                                <div class="task_view-btn ">
                                    <FiEye  />
                                </div>
                            </div>

                        </div>
                    </div>
                    <div className='task_group'>
                        <div className='task_group_heading'>
                            <p>In Progress</p> <span className='task_count'>01</span>
                        </div>
                        <div class="task-card">

                            <div class="task-title">
                                Solve the dribble prioritization issue with the team
                            </div>
                            <div class="task-date">
                                <FiCalendar /> <span>Jan 08,2027</span>
                            </div>
                            <div class="bottom-row">
                                <div class="tag">Artwork</div>
                                <div class="task_view-btn ">
                                    <FiEye  />
                                </div>
                            </div>

                        </div>
                        <div class="task-card">

                            <div class="task-title">
                                Solve the dribble prioritization issue with the team
                            </div>
                            <div class="task-date">
                                <FiCalendar /> <span>Jan 08,2027</span>
                            </div>
                            <div class="bottom-row">
                                <div class="tag">Artwork</div>
                                <div class="task_view-btn ">
                                    <FiEye  />
                                </div>
                            </div>

                        </div>
                    </div>
                    <div className='task_group'>
                        <div className='task_group_heading'>
                            <p>Completed</p> <span className='task_count'>01</span>
                        </div>
                        <div class="task-card">

                            <div class="task-title">
                                Solve the dribble prioritization issue with the team
                            </div>
                            <div class="task-date">
                                <FiCalendar /> <span>Jan 08,2027</span>
                            </div>
                            <div class="bottom-row">
                                <div class="tag">Artwork</div>
                                <div class="task_view-btn ">
                                    <FiEye  />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Tasks;
