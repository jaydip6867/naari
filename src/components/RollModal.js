import React, { useState, useEffect, useMemo, useCallback } from 'react';
import '../styles.css';

const RollModal = ({ isOpen, onClose, onSave, editingRoll }) => {
  const [rollName, setRollName] = useState('');
  const [permissions, setPermissions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Default permissions structure matching API
  const defaultPermissions = useMemo(() => [
    { displayname: 'Users', collectionName: 'users', insertUpdate: false, delete: false, view: false },
    { displayname: 'Role & Permissions', collectionName: 'roles', insertUpdate: false, delete: false, view: false },
    { displayname: 'Measurements', collectionName: 'measurements', insertUpdate: false, delete: false, view: false },
    { displayname: 'Skills', collectionName: 'skills', insertUpdate: false, delete: false, view: false },
    { displayname: 'Orders', collectionName: 'orders', insertUpdate: false, delete: false, view: false },
    { displayname: 'Tasks', collectionName: 'tasks', insertUpdate: false, delete: false, view: false }
  ], []);

  // Map old permission structure to new API structure
  const mapOldPermissionsToNew = useCallback((oldPermissions) => {
    return defaultPermissions.map(perm => {
      const collectionName = perm.collectionName;
      let newPerm = { ...perm };
      
      // Map old structure to new structure
      switch (collectionName) {
        case 'users':
          newPerm.view = oldPermissions.workers?.canView || false;
          newPerm.insertUpdate = oldPermissions.workers?.canAddEdit || false;
          newPerm.delete = oldPermissions.workers?.canAddEdit || false;
          break;
        case 'orders':
          newPerm.view = oldPermissions.orders?.canView || false;
          newPerm.insertUpdate = oldPermissions.orders?.canAddEdit || false;
          newPerm.delete = oldPermissions.orders?.canAddEdit || false;
          break;
        case 'tasks':
          newPerm.view = oldPermissions.tasks?.canView || false;
          newPerm.insertUpdate = oldPermissions.tasks?.canAddEdit || false;
          newPerm.delete = oldPermissions.tasks?.canAddEdit || false;
          break;
        case 'measurements':
          newPerm.view = oldPermissions.measurements?.canView || false;
          newPerm.insertUpdate = oldPermissions.measurements?.canAddEdit || false;
          newPerm.delete = oldPermissions.measurements?.canAddEdit || false;
          break;
        case 'roles':
          newPerm.view = oldPermissions.roles?.canView || false;
          newPerm.insertUpdate = oldPermissions.roles?.canAddEdit || false;
          newPerm.delete = oldPermissions.roles?.canAddEdit || false;
          break;
        case 'skills':
          newPerm.view = oldPermissions.skills?.canView || false;
          newPerm.insertUpdate = oldPermissions.skills?.canAddEdit || false;
          newPerm.delete = oldPermissions.skills?.canAddEdit || false;
          break;
        default:
          break;
      }
      
      return newPerm;
    });
  }, [defaultPermissions]);

  useEffect(() => {
    if (isOpen) {
      if (editingRoll) {
        // Edit mode - populate with existing data
        setRollName(editingRoll.name || '');
        if (editingRoll.permissions && Array.isArray(editingRoll.permissions)) {
          // Already in new format
          setPermissions(editingRoll.permissions);
        } else {
          // Convert from old format to new format
          setPermissions(mapOldPermissionsToNew(editingRoll.permissions || {}));
        }
      } else {
        // Add mode - reset form
        setRollName('');
        setPermissions(defaultPermissions);
      }
      setError('');
    }
  }, [isOpen, editingRoll, defaultPermissions, mapOldPermissionsToNew]);

  const handlePermissionChange = (index, field, value) => {
    const updatedPermissions = [...permissions];
    updatedPermissions[index] = {
      ...updatedPermissions[index],
      [field]: value
    };
    setPermissions(updatedPermissions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!rollName.trim()) {
      setError('Roll name is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const rollData = {
        roleid: editingRoll?._id || editingRoll?.id || '',
        name: rollName.trim(),
        permissions: permissions
      };

      await onSave(rollData);
      
      // Reset form
      setRollName('');
      setPermissions(defaultPermissions);
      onClose();
    } catch (error) {
      console.error('Error saving roll:', error);
      setError(error.message || 'Failed to save roll');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setRollName('');
      setPermissions(defaultPermissions);
      setError('');
      onClose();
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">
            {editingRoll ? 'Edit Roll' : 'Add New Roll'}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div style={{ 
                color: 'var(--alert-color)', 
                background: 'rgba(255, 0, 0, 0.1)', 
                padding: '12px', 
                borderRadius: 'var(--radius-md)', 
                marginBottom: '16px',
                border: '1px solid rgba(255, 0, 0, 0.2)',
                fontSize: '14px'
              }}>
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="roll-name">
                Roll / Designation
              </label>
              <input
                type="text"
                id="roll-name"
                className="form-input"
                placeholder="Enter roll designation"
                value={rollName}
                onChange={(e) => setRollName(e.target.value)}
                autoFocus
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="permissions-section">
              <h3 className="permissions-title">Permissions</h3>
              <table className="permissions-table">
                <thead>
                  <tr>
                    <th>Module</th>
                    <th>View</th>
                    <th>Add/Edit</th>
                    <th>Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {permissions.map((permission, index) => (
                    <tr key={index}>
                      <td className="section-name">{permission.displayname}</td>
                      <td>
                        <div className="permission-toggles">
                          <div
                            className={`toggle-switch ${permission.view ? 'active' : ''}`}
                            onClick={() => handlePermissionChange(index, 'view', !permission.view)}
                          >
                            <div className="toggle-slider"></div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="permission-toggles">
                          <div
                            className={`toggle-switch ${permission.insertUpdate ? 'active' : ''}`}
                            onClick={() => handlePermissionChange(index, 'insertUpdate', !permission.insertUpdate)}
                          >
                            <div className="toggle-slider"></div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="permission-toggles">
                          <div
                            className={`toggle-switch ${permission.delete ? 'active' : ''}`}
                            onClick={() => handlePermissionChange(index, 'delete', !permission.delete)}
                          >
                            <div className="toggle-slider"></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
              disabled={!rollName.trim() || isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RollModal;
