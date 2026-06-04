import React, { useState } from 'react';
import '../styles.css';

const CreateSubcategoryModal = ({ isOpen, onClose, onSave, outfitTypeId }) => {
  const [subcategoryName, setSubcategoryName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!subcategoryName.trim()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSave(subcategoryName.trim(), outfitTypeId);
      setSubcategoryName('');
      onClose();
    } catch (error) {
      console.error('Error saving subcategory:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setSubcategoryName('');
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
        <div className="modal-header simple">
          <h2 className="modal-title">Create Subcategory</h2>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label" htmlFor="subcategory-name">
                Subcategory Name
              </label>
              <input
                type="text"
                id="subcategory-name"
                className="form-input"
                placeholder="Zeels Kachhadiya"
                value={subcategoryName}
                onChange={(e) => setSubcategoryName(e.target.value)}
                autoFocus
                disabled={isSubmitting}
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
              className="btn btn-save orange"
              disabled={!subcategoryName.trim() || isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSubcategoryModal;
