import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar.js';
import '../styles.css';
import { storage } from '../utils/storage';

const Tasks = ({ onLogout }) => {
  const navigate = useNavigate();

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
            <button className="add-btn">+ Add Task</button>
          </div>

          <div className="tasks-list">
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-color)' }}>
              No tasks found
              <div style={{ marginTop: '16px' }}>
                <button className="add-btn">
                  + Add Your First Task
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tasks;
