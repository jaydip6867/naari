import React, { useState, useEffect, useMemo, useCallback } from 'react';
import '../styles.css';
import { userRoleAPI } from '../services/api';

const RollModal = ({ isOpen, onClose, onSave, editingRoll }) => {
  const [rollName, setRollName] = useState('');
  const [permissions, setPermissions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isFetchingPermissions, setIsFetchingPermissions] = useState(false);
  const [fetchError, setFetchError] = useState('');

  // Default permissions structure - will be overwritten by API response
  const defaultPermissions = useMemo(() => [
    { displayname: 'Users', collectionName: 'users', insertUpdate: false, delete: false, view: false },
    { displayname: 'Role & Permissions', collectionName: 'roles', insertUpdate: false, delete: false, view: false },
    { displayname: 'Measurements', collectionName: 'measurements', insertUpdate: false, delete: false, view: false },
    { displayname: 'Skills', collectionName: 'skills', insertUpdate: false, delete: false, view: false },
    { displayname: 'Orders', collectionName: 'orders', insertUpdate: false, delete: false, view: false },
    { displayname: 'Tasks', collectionName: 'tasks', insertUpdate: false, delete: false, view: false }
  ], []);

  // Merge API permissions with existing role permissions
  const mergePermissionsWithAPIData = useCallback(async (rolePermissions) => {
    try {
      setIsFetchingPermissions(true);
      setFetchError('');
      
      // Fetch all available permissions from API
      const permissionsData = await userRoleAPI.getPermission();
      let apiPermissions = [];
      
      // Extract permissions array from API response
      if (Array.isArray(permissionsData)) {
        apiPermissions = permissionsData;
      } else if (permissionsData && typeof permissionsData === 'object') {
        if (Array.isArray(permissionsData.permissions)) {
          apiPermissions = permissionsData.permissions;
        } else {
          apiPermissions = defaultPermissions;
        }
      } else {
        apiPermissions = defaultPermissions;
      }
      
      // Merge: Start with API permissions, then override with existing role permissions
      const mergedPermissions = apiPermissions.map(apiPerm => {
        // Find matching permission in the existing role's permissions
        const existingPerm = rolePermissions.find(
          rolePerm => rolePerm.collectionName === apiPerm.collectionName
        );
        
        // If found, merge the values; otherwise use API values
        if (existingPerm) {
          return {
            displayname: existingPerm.displayname || apiPerm.displayname,
            collectionName: apiPerm.collectionName,
            view: existingPerm.view ?? apiPerm.view ?? false,
            insertUpdate: existingPerm.insertUpdate ?? apiPerm.insertUpdate ?? false,
            delete: existingPerm.delete ?? apiPerm.delete ?? false
          };
        }
        
        // Return API permission if no match found
        return {
          ...apiPerm,
          view: apiPerm.view ?? false,
          insertUpdate: apiPerm.insertUpdate ?? false,
          delete: apiPerm.delete ?? false
        };
      });
      
      setPermissions(mergedPermissions);
    } catch (err) {
      console.error('Error merging permissions:', err);
      setFetchError(err.response.data.Message || 'Failed to fetch permissions');
      // Fallback to role's existing permissions
      if (Array.isArray(rolePermissions)) {
        setPermissions(rolePermissions);
      } else {
        setPermissions(defaultPermissions);
      }
    } finally {
      setIsFetchingPermissions(false);
    }
  }, [defaultPermissions]);

  // Fetch permissions from API for adding new role
  const fetchPermissionsFromAPI = useCallback(async () => {
    try {
      setIsFetchingPermissions(true);
      setFetchError('');
      const permissionsData = await userRoleAPI.getPermission();
      
      // If API returns an array of permissions, use it directly
      if (Array.isArray(permissionsData)) {
        setPermissions(permissionsData);
      } else if (permissionsData && typeof permissionsData === 'object') {
        // If API returns an object, check if it has a permissions property
        if (Array.isArray(permissionsData.permissions)) {
          setPermissions(permissionsData.permissions);
        } else {
          // Fallback to default if structure doesn't match
          setPermissions(defaultPermissions);
        }
      } else {
        // Fallback to default permissions
        setPermissions(defaultPermissions);
      }
    } catch (err) {
      console.error('Error fetching permissions:', err);
      setFetchError(err.response.data.Message || 'Failed to fetch permissions');
      // Use default permissions on error
      setPermissions(defaultPermissions);
    } finally {
      setIsFetchingPermissions(false);
    }
  }, [defaultPermissions]);

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
        // Edit mode - fetch latest permissions from API and merge with existing role permissions
        setRollName(editingRoll.name || '');
        
        let rolePermissions = [];
        if (editingRoll.permissions && Array.isArray(editingRoll.permissions)) {
          // Already in new format
          rolePermissions = editingRoll.permissions;
        } else if (editingRoll.permissions && typeof editingRoll.permissions === 'object') {
          // Convert from old format to new format
          rolePermissions = mapOldPermissionsToNew(editingRoll.permissions);
        }
        
        // Merge API permissions with existing role permissions
        mergePermissionsWithAPIData(rolePermissions);
      } else {
        // Add mode - fetch permissions from API
        setRollName('');
        fetchPermissionsFromAPI();
      }
      setError('');
      setFetchError('');
    }
  }, [isOpen, editingRoll, fetchPermissionsFromAPI, mergePermissionsWithAPIData, mapOldPermissionsToNew]);

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
    if (!isSubmitting && !isFetchingPermissions) {
      setRollName('');
      setPermissions(defaultPermissions);
      setError('');
      setFetchError('');
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

            {fetchError && (
              <div style={{ 
                color: 'var(--alert-color)', 
                background: 'rgba(255, 0, 0, 0.1)', 
                padding: '12px', 
                borderRadius: 'var(--radius-md)', 
                marginBottom: '16px',
                border: '1px solid rgba(255, 0, 0, 0.2)',
                fontSize: '14px'
              }}>
                {fetchError}
              </div>
            )}

            {isFetchingPermissions && (
              <div style={{ 
                color: 'var(--text-secondary)', 
                background: 'rgba(100, 100, 100, 0.1)', 
                padding: '12px', 
                borderRadius: 'var(--radius-md)', 
                marginBottom: '16px',
                border: '1px solid rgba(100, 100, 100, 0.2)',
                fontSize: '14px',
                textAlign: 'center'
              }}>
                Loading permissions...
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
                disabled={isSubmitting || isFetchingPermissions}
                required
              />
            </div>

            <div className="permissions-section">
              <h3 className="permissions-title">Permissions</h3>
              {permissions.length > 0 ? (
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
                              onClick={() => !isFetchingPermissions && handlePermissionChange(index, 'view', !permission.view)}
                              style={{ cursor: isFetchingPermissions ? 'not-allowed' : 'pointer' }}
                            >
                              <div className="toggle-slider"></div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="permission-toggles">
                            <div
                              className={`toggle-switch ${permission.insertUpdate ? 'active' : ''}`}
                              onClick={() => !isFetchingPermissions && handlePermissionChange(index, 'insertUpdate', !permission.insertUpdate)}
                              style={{ cursor: isFetchingPermissions ? 'not-allowed' : 'pointer' }}
                            >
                              <div className="toggle-slider"></div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="permission-toggles">
                            <div
                              className={`toggle-switch ${permission.delete ? 'active' : ''}`}
                              onClick={() => !isFetchingPermissions && handlePermissionChange(index, 'delete', !permission.delete)}
                              style={{ cursor: isFetchingPermissions ? 'not-allowed' : 'pointer' }}
                            >
                              <div className="toggle-slider"></div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ 
                  padding: '20px', 
                  textAlign: 'center', 
                  color: 'var(--text-secondary)',
                  fontSize: '14px'
                }}>
                  {isFetchingPermissions ? 'Loading permissions...' : 'No permissions available'}
                </div>
              )}
            </div>
          </div>
          
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-cancel"
              onClick={handleClose}
              disabled={isSubmitting || isFetchingPermissions}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-save"
              disabled={!rollName.trim() || isSubmitting || isFetchingPermissions}
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
