import React, { useState, useEffect } from 'react';
import '../styles.css';

const SkillModal = ({ isOpen, onClose, onSave, editingSkill }) => {
  const [skillName, setSkillName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (editingSkill) {
        // Edit mode - populate with existing data
        setSkillName(editingSkill.name || '');
      } else {
        // Add mode - reset form
        setSkillName('');
      }
      setError('');
    }
  }, [isOpen, editingSkill]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!skillName.trim()) {
      setError('Skill name is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const skillData = {
        name: skillName.trim(),
        type: 'Add'
      };

      await onSave(skillData);
      
      // Reset form
      setSkillName('');
      onClose();
    } catch (error) {
      console.error('Error saving skill:', error);
      setError(error.message || 'Failed to save skill');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setSkillName('');
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
            {editingSkill ? 'Edit Skill' : 'Add New Skill'}
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
              <label className="form-label">Skill Name</label>
              <input
                type="text"
                className="form-input"
                value={skillName}
                onChange={(e) => setSkillName(e.target.value)}
                placeholder="Enter skill name"
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
              disabled={!skillName.trim() || isSubmitting}
            >
              {isSubmitting ? 'Saving...' : (editingSkill?.type === 'Remove' ? 'Remove Skill' : 'Add Skill')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SkillModal;
