import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StaffModal from './StaffModal.js';
import Sidebar from './Sidebar.js';
import '../styles.css';
import { storage } from '../utils/storage';
import { staffAPI } from '../services/api';
import { FiEdit, FiX } from 'react-icons/fi';

const Team = ({ onLogout }) => {
  const navigate = useNavigate();
  const [staff, setStaff] = useState([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffError, setStaffError] = useState('');
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  const handleLogout = () => {
    storage.clearAuthData();
    onLogout();
    navigate('/');
  };

  const fetchStaff = async () => {
    try {
      setStaffLoading(true);
      setStaffError('');
      const staffData = await staffAPI.getStaff();

      let staffList = [];
      if (Array.isArray(staffData)) {
        staffList = staffData;
      } else if (staffData && Array.isArray(staffData.data)) {
        staffList = staffData.data;
      } else if (staffData && Array.isArray(staffData.staffList)) {
        staffList = staffData.staffList;
      } else if (staffData && typeof staffData === 'object') {
        staffList = Object.values(staffData).find(Array.isArray) || [];
      }

      setStaff(staffList);
    } catch (err) {
      console.error('Error fetching staff:', err);
      setStaffError(err.response.data.Message || 'Failed to fetch staff');
    } finally {
      setStaffLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const saveStaff = async (staffData) => {
    try {
      const savedStaff = await staffAPI.saveStaff(staffData);
      await fetchStaff();
      return savedStaff;
    } catch (err) {
      console.error('Error saving staff:', err);
      throw err;
    }
  };

  const deleteStaff = async (staffId) => {
    try {
      const deletedStaff = await staffAPI.deleteStaff(staffId);
      await fetchStaff();
      return deletedStaff;
    } catch (err) {
      console.error('Error deleting staff:', err);
      throw err;
    }
  };

  const openStaffModal = () => {
    setEditingStaff(null);
    setIsStaffModalOpen(true);
  };

  const openEditStaffModal = async (staffMember) => {
    try {
      const staffId = staffMember._id || staffMember.staffId;
      if (staffId) {
        const fullStaffData = await staffAPI.getStaffById(staffId);
        setEditingStaff(fullStaffData);
      } else {
        setEditingStaff(staffMember);
      }
    } catch (err) {
      console.error('Error fetching staff details:', err);
      setEditingStaff(staffMember);
    }
    setIsStaffModalOpen(true);
  };

  const closeStaffModal = () => {
    setIsStaffModalOpen(false);
    setEditingStaff(null);
  };

  return (
    <div className="settings-container">
      <Sidebar onLogout={handleLogout} />

      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">Team Management</h1>
        </div>

        {staffError && (
            <div className="error-badge">
              {staffError}
            </div>
          )}


        <div className="content-section">
          <div className="section-header">
            <h2 className="section-title">Staff Account</h2>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="add-btn" onClick={openStaffModal}>+ Add Staff</button>
            </div>
          </div>

          {staffLoading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--primary-color)' }}>
              Loading staff...
            </div>
          ) : Array.isArray(staff) && staff.length > 0 ? (
            <div className="roll-list">
              {staff.map((staffMember, index) => (
                <div key={staffMember._id || index} className="roll-item">
                  <div className="roll-info">
                    <div className="roll-name">{staffMember.name || staffMember.fullName || 'Unknown'}</div>
                    <div className="roll-details">
                      <span className="roll-role theme-color">- {staffMember.roleid?.name || ''}</span>
                    </div>
                  </div>
                  <div className="roll-actions">
                    <button
                      className="edit-btn"
                      onClick={() => openEditStaffModal(staffMember)}
                      title="Edit Staff"
                    >
                      <FiEdit />
                    </button>
                    <FiX className='delete-field-icon' onClick={() => deleteStaff(staffMember._id)} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
              <div style={{ marginBottom: '16px' }}>
                <p>No staff members found.</p>
                <button className="add-btn" onClick={openStaffModal}>+ Add Your First Staff Member</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <StaffModal
        isOpen={isStaffModalOpen}
        onClose={closeStaffModal}
        onSave={saveStaff}
        editingStaff={editingStaff}
      />
    </div>
  );
};

export default Team;
