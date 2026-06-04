import React, { useState, useEffect } from 'react';
import '../styles.css';

const FinanceTypeModal = ({ isOpen, onClose, onSave }) => {
  const [categoryKind, setCategoryKind] = useState('income');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setCategoryKind('income');
      setName('');
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onSave({
        name: name.trim(),
        type: 'Add',
        categoryKind,
      });
      setName('');
      onClose();
    } catch (err) {
      console.error('Error saving finance type:', err);
      setError(err.response.data.Message || 'Failed to save type');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setName('');
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
          <h3 className="modal-title">Add Type</h3>
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
                fontSize: '14px',
              }}>
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Type</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="categoryKind"
                    value="income"
                    checked={categoryKind === 'income'}
                    onChange={() => setCategoryKind('income')}
                    disabled={isSubmitting}
                  />
                  <span>Income</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="categoryKind"
                    value="expense"
                    checked={categoryKind === 'expense'}
                    onChange={() => setCategoryKind('expense')}
                    disabled={isSubmitting}
                  />
                  <span>Expense</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Name</label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter type name"
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
              disabled={!name.trim() || isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Add Type'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FinanceTypeModal;
