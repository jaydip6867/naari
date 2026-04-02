import React, { useState, useEffect } from 'react';
import '../styles.css';
import { FiEye, FiEyeOff, FiUpload, FiX } from 'react-icons/fi';
import { uploadAPI, workTypeAPI, userRoleAPI, skillsAPI } from '../services/api';

const StaffModal = ({ isOpen, onClose, onSave, editingStaff, userRoles }) => {
  const [staffData, setStaffData] = useState({
    staffId: '',
    fullName: '',
    roleid: '',
    userId: '',
    password: '',
    mobile: '',
    address: '',
    workTypes: [],
    skills: [],
    identityProof: [],
    type: 'staff'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [workTypesList, setWorkTypesList] = useState([]);
  const [rolesList, setRolesList] = useState([]);
  const [skillsList, setSkillsList] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Fetch work types and roles
      fetchWorkTypes();
      fetchRoles();
      fetchSkills();
      
      if (editingStaff) {
        setStaffData({
          staffId: editingStaff._id || editingStaff.staffId || '',
          fullName: editingStaff.fullName || editingStaff.name || '',
          roleid: editingStaff.roleid || editingStaff.roleId || '',
          userId: editingStaff.userId || editingStaff.userName || '',
          password: '', // Don't populate password for security
          mobile: editingStaff.mobile || '',
          address: editingStaff.address || '',
          skills: editingStaff.skills || [],
          workTypes: editingStaff.workTypes || [],
          identityProof: editingStaff.identityProof || [],
          type: editingStaff.type || 'staff'
        });
      } else {
        setStaffData({
          staffId: '',
          fullName: '',
          roleid: '',
          userId: '',
          password: '',
          mobile: '',
          address: '',
          skills: [],
          workTypes: [],
          identityProof: [],
          type: 'staff'
        });
      }
      setError('');
    }
  }, [isOpen, editingStaff]);

  // Auto-select role by matching role name when roles are loaded
  useEffect(() => {
    if (editingStaff && rolesList.length > 0 && !staffData.roleid) {
      const staffRoleName = editingStaff.roleName || editingStaff.rolename || editingStaff.role || '';
      if (staffRoleName) {
        const matchedRole = rolesList.find(role => 
          (role.name || role.roleName || '') === staffRoleName || 
          (role._id || role.id) === (editingStaff.roleid || editingStaff.roleId)
        );
        if (matchedRole) {
          setStaffData(prev => ({
            ...prev,
            roleid: matchedRole._id || matchedRole.id
          }));
        }
      }
    }
  }, [rolesList, editingStaff, staffData.roleid]);

  const fetchRoles = async () => {
    try {
      const response = await userRoleAPI.listRoles();
      setRolesList(response || []);
    } catch (err) {
      console.error('Error fetching roles:', err);
    }
  };

  const fetchSkills = async () => {
    try {
      const response = await skillsAPI.getSkills();
      setSkillsList(response || []);
    } catch (err) {
      console.error('Error fetching skills:', err);
    }
  };

  const fetchWorkTypes = async () => {
    try {
      const response = await workTypeAPI.getWorkTypes();
      console.log(response)
      setWorkTypesList(response || []);
    } catch (err) {
      console.error('Error fetching work types:', err);
    }
  };

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

  const handleTypeChange = (type) => {
    setStaffData(prev => ({
      ...prev,
      type: type
    }));
  };

  const handleSkillChange = (skill) => {
    setStaffData(prev => {
      const currentSkills = prev.skills || [];
      if (currentSkills.includes(skill)) {
        return {
          ...prev,
          skills: currentSkills.filter(s => s !== skill)
        };
      } else {
        return {
          ...prev,
          skills: [...currentSkills, skill]
        };
      }
    });
  };

  const handleWorkTypeChange = (workType) => {
    setStaffData(prev => {
      const currentWorkTypes = prev.workTypes || [];
      if (currentWorkTypes.includes(workType)) {
        return {
          ...prev,
          workTypes: currentWorkTypes.filter(wt => wt !== workType)
        };
      } else {
        return {
          ...prev,
          workTypes: [...currentWorkTypes, workType]
        };
      }
    });
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingFiles(true);
    setError('');

    try {
      const uploadedFiles = await uploadAPI.uploadMultipleImages(files);
      setStaffData(prev => ({
        ...prev,
        identityProof: [...prev.identityProof, ...uploadedFiles]
      }));
    } catch (err) {
      console.error('Error uploading files:', err);
      setError('Failed to upload identity proof files');
    } finally {
      setUploadingFiles(false);
    }
  };

  const removeIdentityProof = (index) => {
    setStaffData(prev => ({
      ...prev,
      identityProof: prev.identityProof.filter((_, i) => i !== index)
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
    if (!staffData.mobile?.toString().trim()) {
      setError('Mobile is required');
      return;
    }
    if (!staffData.address?.toString().trim()) {
      setError('Address is required');
      return;
    }
    if (!staffData.type?.toString().trim()) {
      setError('Type is required');
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
        userId: staffData.userId,
        mobile: staffData.mobile,
        address: staffData.address,
        workTypes: staffData.workTypes,
        skills: staffData.skills,
        identityProof: staffData.identityProof,
        type: staffData.type
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
    <div className="modal-overlay staff-modal">
      <div className="modal">
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

          <div className="form-grid">

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
              {rolesList && rolesList.map((role) => (
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
            <div className="password-input-wrapper" style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={staffData.password}
                onChange={handleInputChange}
                className="form-input"
                placeholder={editingStaff ? "Leave blank to keep current password" : "Enter password"}
                disabled={isSubmitting}
                required={!editingStaff}
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isSubmitting}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="mobile" className="form-label">Mobile *</label>
            <input
              type="text"
              id="mobile"
              name="mobile"
              value={staffData.mobile}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter mobile number"
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Type *</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  name="type"
                  value="staff"
                  checked={staffData.type === 'staff'}
                  onChange={() => handleTypeChange('staff')}
                  disabled={isSubmitting}
                />
                Staff
              </label>
              <label>
                <input
                  type="radio"
                  name="type"
                  value="worker"
                  checked={staffData.type === 'worker'}
                  onChange={() => handleTypeChange('worker')}
                  disabled={isSubmitting}
                />
                Worker
              </label>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Skills</label>
            <div className="checkbox-group" style={{ display: 'flex', gap: '8px' }}>
              {skillsList.map((skill) => (
                <label key={skill} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    name="skills"
                    value={skill}
                    checked={staffData.skills?.includes(skill)}
                    onChange={() => handleSkillChange(skill)}
                    disabled={isSubmitting}
                  />
                  {skill}
                </label>
              ))}
              {skillsList.length === 0 && (
                <span style={{ color: '#888', fontSize: '14px' }}>No skills available</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Work Types</label>
            <div className="radio-group" style={{ display: 'flex', gap: '8px' }}>
              {workTypesList.map((workType) => (
                <label key={workType} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    name="workTypes"
                    value={workType}
                    checked={staffData.workTypes?.includes(workType)}
                    onChange={() => handleWorkTypeChange(workType)}
                    disabled={isSubmitting}
                  />
                  {workType|| 'Unknown'}
                </label>
              ))}
              {workTypesList.length === 0 && (
                <span style={{ color: '#888', fontSize: '14px' }}>No work types available</span>
              )}
            </div>
          </div>

          <div className="form-group full-width">
            <label htmlFor="address" className="form-label">Address *</label>
            <textarea
              id="address"
              name="address"
              value={staffData.address}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter address"
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Identity Proof</label>
            <div className="file-upload-wrapper">
              <input
                type="file"
                id="identityProof"
                name="identityProof"
                onChange={handleFileUpload}
                className="form-input"
                disabled={isSubmitting || uploadingFiles}
                multiple
                accept="image/*,.pdf,.doc,.docx"
                style={{ display: 'none' }}
              />
              <label htmlFor="identityProof" className="file-upload-btn" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                backgroundColor: '#f0f0f0',
                border: '2px dashed #ccc',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}>
                <FiUpload size={18} />
                {uploadingFiles ? 'Uploading...' : 'Upload Files'}
              </label>
            </div>
            
            {/* Preview of uploaded files */}
            {staffData.identityProof && staffData.identityProof.length > 0 && (
              <div className="file-preview-container" style={{ 
                marginTop: '12px', 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '10px' 
              }}>
                {staffData.identityProof.map((file, index) => (
                  <div key={index} className="file-preview" style={{
                    position: 'relative',
                    width: '80px',
                    // height: '80px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    overflow: 'hidden'
                  }}>
                    {file && (file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png') || file.endsWith('.gif') || file.endsWith('.webp')) ? (
                      <img 
                        src={file} 
                        alt={`Identity proof ${index + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#f5f5f5',
                        fontSize: '12px',
                        textAlign: 'center',
                        padding: '4px'
                      }}>
                        {file || 'File'}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeIdentityProof(index)}
                      style={{
                        position: 'absolute',
                        top: '2px',
                        right: '2px',
                        background: '#ff4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        padding: '0'
                      }}
                      disabled={isSubmitting}
                    >
                      <FiX size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
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
              disabled={!staffData.fullName?.toString().trim() || !staffData.roleid?.toString().trim() || !staffData.userId?.toString().trim() || !staffData.mobile?.toString().trim() || !staffData.address?.toString().trim() || !staffData.type?.toString().trim() || (!editingStaff && !staffData.password?.toString().trim()) || isSubmitting}
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
