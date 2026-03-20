import React, { useState } from 'react';
import '../styles.css';

const RollModal = ({ isOpen, onClose, onSave, editingRoll }) => {
  const [rollName, setRollName] = useState(editingRoll?.name || '');
  const [permissions, setPermissions] = useState(
    editingRoll?.permissions || {
      dashboard: { canView: true, canAddEdit: false },
      orders: { canView: true, canAddEdit: false },
      workers: { canView: true, canAddEdit: false },
      tasks: { canView: true, canAddEdit: false },
      settings: { canView: false, canAddEdit: false }
    }
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sections = [
    { key: 'dashboard', name: 'Dashboard' },
    { key: 'orders', name: 'Orders' },
    { key: 'workers', name: 'Workers' },
    { key: 'tasks', name: 'Tasks' },
    { key: 'settings', name: 'Settings' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!rollName.trim()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSave({
        id: editingRoll?.id || Date.now(),
        name: rollName.trim(),
        permissions
      });
      setRollName('');
      setPermissions({
        dashboard: { canView: true, canAddEdit: false },
        orders: { canView: true, canAddEdit: false },
        workers: { canView: true, canAddEdit: false },
        tasks: { canView: true, canAddEdit: false },
        settings: { canView: false, canAddEdit: false }
      });
      onClose();
    } catch (error) {
      console.error('Error saving roll:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setRollName('');
      setPermissions({
        dashboard: { canView: true, canAddEdit: false },
        orders: { canView: true, canAddEdit: false },
        workers: { canView: true, canAddEdit: false },
        tasks: { canView: true, canAddEdit: false },
        settings: { canView: false, canAddEdit: false }
      });
      onClose();
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const togglePermission = (section, permission) => {
    setPermissions(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [permission]: !prev[section][permission]
      }
    }));
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
              />
            </div>

            <div className="permissions-section">
              <h3 className="permissions-title">Permissions</h3>
              <table className="permissions-table">
                <thead>
                  <tr>
                    <th>Section</th>
                    <th>Can View</th>
                    <th>Can Add/Edit</th>
                  </tr>
                </thead>
                <tbody>
                  {sections.map(section => (
                    <tr key={section.key}>
                      <td className="section-name">{section.name}</td>
                      <td>
                        <div className="permission-toggles">
                          <div
                            className={`toggle-switch ${permissions[section.key].canView ? 'active' : ''}`}
                            onClick={() => togglePermission(section.key, 'canView')}
                          >
                            <div className="toggle-slider"></div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="permission-toggles">
                          <div
                            className={`toggle-switch ${permissions[section.key].canAddEdit ? 'active' : ''}`}
                            onClick={() => togglePermission(section.key, 'canAddEdit')}
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
