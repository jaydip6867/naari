import React, { useState, useEffect } from 'react';
import '../styles.css';

const StaffModal = ({ isOpen, onClose, onSave, editingStaff, userRoles }) => {
  const [staffData, setStaffData] = useState({
    staffId: '',
    fullName: '',
    roleid: '',
    userId: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (editingStaff) {
        setStaffData({
          staffId: editingStaff._id || editingStaff.staffId || '',
          fullName: editingStaff.fullName || editingStaff.name || '',
          roleid: editingStaff.roleid || editingStaff.roleId || '',
          userId: editingStaff.userId || editingStaff.userName || '',
          password: '' // Don't populate password for security
        });
      } else {
        setStaffData({
          staffId: '',
          fullName: '',
          roleid: '',
          userId: '',
          password: ''
        });
      }
      setError('');
    }
  }, [isOpen, editingStaff]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStaffData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleChange = (e) => {
    setStaffData(prev => ({
      ...prev,
      roleid: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation - all fields required for both create and update
    if (!staffData.fullName?.toString().trim()) {
      setError('Full Name is required');
      return;
    }
    if (!staffData.roleid?.toString().trim()) {
      setError('Role is required');
      return;
    }
    if (!staffData.userId?.toString().trim()) {
      setError('User ID is required');
      return;
    }
    
    // Password validation
    if (!editingStaff) {
      // For new staff - password is required
      if (!staffData.password?.toString().trim()) {
        setError('Password is required for new staff');
        return;
      }
    } else {
      // For editing - password is optional but if provided, must be valid
      if (staffData.password !== undefined && staffData.password !== null) {
        if (!staffData.password.toString().trim()) {
          setError('Password cannot be empty');
          return;
        }
      }
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Prepare data for API
      let apiData = {
        fullName: staffData.fullName,
        roleid: staffData.roleid,
        userId: staffData.userId
      };

      // Handle staffId for updates
      if (staffData.staffId) {
        apiData.staffId = staffData.staffId;
      }

      // Handle password logic
      if (editingStaff) {
        // For editing - only include password if it's provided
        if (staffData.password && staffData.password.trim()) {
          apiData.password = staffData.password;
        }
        // If password is blank, don't include password field (backend will keep old password)
      } else {
        // For new staff - password is required
        apiData.password = staffData.password;
      }

      // console.log('StaffModal - Submitting data:', apiData);
      // console.log('StaffModal - staffId being sent:', apiData.staffId);

      await onSave(apiData);
      onClose();
    } catch (err) {
      console.error('Error saving staff:', err);
      setError(err.message || 'Failed to save staff');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal small">
        <div className="modal-header">
          <h3 className="modal-title">{editingStaff ? 'Edit Staff' : 'Add New Staff'}</h3>
        </div>
        <div className="modal-body">
        <form onSubmit={handleSubmit} className="modal-form">
          {error && (
            <div className="modal-error">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="fullName" className="form-label">Full Name *</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={staffData.fullName}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter staff full name"
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Role *</label>
            <select
              className="form-input"
              name="roleid"
              value={staffData.roleid || ''}
              onChange={handleRoleChange}
              disabled={isSubmitting}
              required
            >
              <option value="">Select a role</option>
              {userRoles && userRoles.map((role) => (
                <option key={role._id || role.id} value={role._id || role.id}>
                  {role.name || role.roleName || 'Unknown Role'}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="userId" className="form-label">User ID *</label>
            <input
              type="text"
              id="userId"
              name="userId"
              value={staffData.userId}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter user ID"
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password {!editingStaff && '*'}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={staffData.password}
              onChange={handleInputChange}
              className="form-input"
              placeholder={editingStaff ? "Leave blank to keep current password" : "Enter password"}
              disabled={isSubmitting}
              required={!editingStaff}
            />
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-cancel"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-save"
              disabled={!staffData.fullName?.toString().trim() || !staffData.roleid?.toString().trim() || !staffData.userId?.toString().trim() || (!editingStaff && !staffData.password?.toString().trim()) || isSubmitting}
            >
              {isSubmitting ? 'Saving...' : (editingStaff ? 'Update Staff' : 'Add Staff')}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default StaffModal;
