import React, { useState, useEffect } from 'react';
import '../styles.css';

const WorkTypeModal = ({ isOpen, onClose, onSave, editingWorkType }) => {
  const [workTypeName, setWorkTypeName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (editingWorkType) {
        // Edit mode - populate with existing data
        setWorkTypeName(editingWorkType.name || '');
      } else {
        // Add mode - reset form
        setWorkTypeName('');
      }
      setError('');
    }
  }, [isOpen, editingWorkType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!workTypeName.trim()) {
      setError('Work type name is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const workTypeData = {
        name: workTypeName.trim(),
        type: editingWorkType?.type || 'Add' // Use existing type or default to Add
      };

      await onSave(workTypeData);
      
      // Reset form
      setWorkTypeName('');
      onClose();
    } catch (error) {
      console.error('Error saving work type:', error);
      setError(error.message || 'Failed to save work type');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setWorkTypeName('');
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
      <div className="modal small">
        <div className="modal-header">
          <h3 className="modal-title">
            {editingWorkType ? 'Edit Work Type' : 'Add New Work Type'}
          </h3>
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
              <label className="form-label">Work Type Name</label>
              <input
                type="text"
                className="form-input"
                value={workTypeName}
                onChange={(e) => setWorkTypeName(e.target.value)}
                placeholder="Enter work type name"
                disabled={isSubmitting}
                required
                autoFocus
              />
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
              disabled={!workTypeName.trim() || isSubmitting}
            >
              {isSubmitting ? 'Saving...' : (editingWorkType?.type === 'Remove' ? 'Remove Work Type' : 'Add Work Type')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkTypeModal;
