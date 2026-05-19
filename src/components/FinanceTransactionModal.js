import React, { useState, useEffect, useRef } from 'react';
import '../styles.css';

const resolveOrderId = (orderRef) => {
  if (typeof orderRef === 'object' && orderRef !== null) {
    return orderRef._id || '';
  }
  return orderRef || '';
};

const FinanceTransactionModal = ({
  isOpen,
  onClose,
  onSave,
  editingTransaction = null,
  incomeTypes = [],
  expenseTypes = [],
  orders = [],
}) => {
  const [transactionType, setTransactionType] = useState('income');
  const [typeName, setTypeName] = useState('');
  const [name, setName] = useState('');
  const [orderId, setOrderId] = useState('');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const prevTransactionTypeRef = useRef(null);

  const isEditMode = Boolean(editingTransaction);
  const typeOptions = transactionType === 'income' ? incomeTypes : expenseTypes;

  useEffect(() => {
    if (isOpen) {
      prevTransactionTypeRef.current = null;

      if (editingTransaction) {
        const type = (editingTransaction.type || 'income').toLowerCase();
        setTransactionType(type === 'expense' ? 'expense' : 'income');
        setTypeName(editingTransaction.typeName || '');
        setName(editingTransaction.name || '');
        setOrderId(resolveOrderId(editingTransaction.orderId));
        setAmount(
          editingTransaction.amount != null ? String(editingTransaction.amount) : ''
        );
        prevTransactionTypeRef.current = type === 'expense' ? 'expense' : 'income';
      } else {
        setTransactionType('income');
        setTypeName('');
        setName('');
        setOrderId('');
        setAmount('');
        prevTransactionTypeRef.current = 'income';
      }
      setError('');
    }
  }, [isOpen, editingTransaction]);

  useEffect(() => {
    if (!isOpen || prevTransactionTypeRef.current === null) return;
    if (prevTransactionTypeRef.current !== transactionType) {
      setTypeName('');
    }
    prevTransactionTypeRef.current = transactionType;
  }, [transactionType, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!typeName) {
      setError('Type name is required');
      return;
    }
    if (!orderId) {
      setError('Order is required');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onSave({
        _id: editingTransaction?._id || '',
        type: transactionType,
        typeName,
        name: name.trim(),
        orderId,
        amount: Number(amount),
      });
      onClose();
    } catch (err) {
      console.error('Error saving transaction:', err);
      setError(err.message || 'Failed to save transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const getOrderLabel = (order) => {
    if (order.orderId) return order.orderId;
    if (order.orderName) return order.orderName;
    if (typeof order.customerId === 'object' && order.customerId?.fullName) {
      return order.customerId.fullName;
    }
    return `Order ${order._id?.slice(-6) || ''}`;
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal small">
        <div className="modal-header">
          <h3 className="modal-title">{isEditMode ? 'Edit Transaction' : 'Add Transaction'}</h3>
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
              <select
                className="form-input"
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value)}
                disabled={isSubmitting}
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Type Name</label>
              <select
                className="form-input"
                value={typeName}
                onChange={(e) => setTypeName(e.target.value)}
                disabled={isSubmitting || typeOptions.length === 0}
                required
              >
                <option value="">Select type name</option>
                {typeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
                {typeName && !typeOptions.includes(typeName) && (
                  <option value={typeName}>{typeName}</option>
                )}
              </select>
              {typeOptions.length === 0 && !typeName && (
                <p style={{ fontSize: '12px', color: 'var(--gray-color)', marginTop: '6px' }}>
                  No {transactionType} types found. Add a type first.
                </p>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Name</label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter name"
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Order</label>
              <select
                className="form-input"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                disabled={isSubmitting || orders.length === 0}
                required
              >
                <option value="">Select order</option>
                {orders.map((order) => (
                  <option key={order._id} value={order._id}>
                    {getOrderLabel(order)}
                  </option>
                ))}
                {orderId && !orders.some((o) => o._id === orderId) && (
                  <option value={orderId}>Selected order</option>
                )}
              </select>
              {orders.length === 0 && (
                <p style={{ fontSize: '12px', color: 'var(--gray-color)', marginTop: '6px' }}>
                  No orders available.
                </p>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Amount</label>
              <input
                type="number"
                className="form-input"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                min="0"
                step="0.01"
                disabled={isSubmitting}
                required
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
              disabled={isSubmitting || !typeName || !orderId || !amount}
            >
              {isSubmitting ? 'Saving...' : isEditMode ? 'Update Transaction' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FinanceTransactionModal;
