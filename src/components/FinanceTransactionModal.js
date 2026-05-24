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
  const [paymentType, setPaymentType] = useState('cash');

  // Type Name search state
  const [typeNameSearchInput, setTypeNameSearchInput] = useState('');
  const [showTypeNameDropdown, setShowTypeNameDropdown] = useState(false);
  const [filteredTypeNames, setFilteredTypeNames] = useState([]);

  // Order search state
  const [orderSearchInput, setOrderSearchInput] = useState('');
  const [showOrderDropdown, setShowOrderDropdown] = useState(false);
  const [filteredOrders, setFilteredOrders] = useState([]);

  const isEditMode = Boolean(editingTransaction);
  const typeOptions = transactionType === 'income' ? incomeTypes : expenseTypes;

  useEffect(() => {
    if (isOpen) {
      prevTransactionTypeRef.current = null;

      if (editingTransaction) {
        const type = (editingTransaction.type || 'income').toLowerCase();
        setTransactionType(type === 'expense' ? 'expense' : 'income');
        setTypeName(editingTransaction.typeName || '');
        setTypeNameSearchInput(editingTransaction.typeName || '');
        setName(editingTransaction.name || '');
        setOrderId(resolveOrderId(editingTransaction.orderId));
        setPaymentType(editingTransaction.paymentType || '');
        setAmount(
          editingTransaction.amount != null ? String(editingTransaction.amount) : ''
        );
        prevTransactionTypeRef.current = type === 'expense' ? 'expense' : 'income';
      } else {
        setTransactionType('income');
        setTypeName('');
        setTypeNameSearchInput('');
        setName('');
        setOrderId('');
        setOrderSearchInput('');
        setAmount('');
        setPaymentType('cash');
        prevTransactionTypeRef.current = 'income';
      }
      setError('');
    }
  }, [isOpen, editingTransaction]);

  useEffect(() => {
    if (!isOpen || prevTransactionTypeRef.current === null) return;
    if (prevTransactionTypeRef.current !== transactionType) {
      setTypeName('');
      setTypeNameSearchInput('');
    }
    prevTransactionTypeRef.current = transactionType;
  }, [transactionType, isOpen]);

  // Initialize order search input when editing existing transaction
  useEffect(() => {
    if (isOpen && orderId && orders.length > 0) {
      const order = orders.find(o => o._id === orderId);
      if (order) {
        setOrderSearchInput(getOrderLabel(order));
      }
    }
  }, [isOpen, orderId, orders]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!typeName) {
      setError('Type name is required');
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
        paymentMethod: paymentType,
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

  // Type Name search handlers
  const handleTypeNameSearch = (e) => {
    const value = e.target.value;
    setTypeNameSearchInput(value);

    if (value.trim() === '') {
      setFilteredTypeNames(typeOptions);
      setShowTypeNameDropdown(true);
    } else {
      const filtered = typeOptions.filter(option =>
        option.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredTypeNames(filtered);
      setShowTypeNameDropdown(true);
    }
  };

  const handleTypeNameFocus = () => {
    setFilteredTypeNames(typeOptions);
    setShowTypeNameDropdown(true);
  };

  const handleTypeNameSelect = (typeNameValue) => {
    setTypeNameSearchInput(typeNameValue);
    setTypeName(typeNameValue);
    setShowTypeNameDropdown(false);
    setFilteredTypeNames([]);
  };

  const handleTypeNameInputBlur = () => {
    setTimeout(() => {
      setShowTypeNameDropdown(false);
    }, 200);
  };

  // Order search handlers
  const handleOrderSearch = (e) => {
    const value = e.target.value;
    setOrderSearchInput(value);

    if (value.trim() === '') {
      setFilteredOrders(orders);
      setShowOrderDropdown(true);
    } else {
      const filtered = orders.filter(order =>
        getOrderLabel(order).toLowerCase().includes(value.toLowerCase())
      );
      setFilteredOrders(filtered);
      setShowOrderDropdown(true);
    }
  };

  const handleOrderFocus = () => {
    setFilteredOrders(orders);
    setShowOrderDropdown(true);
  };

  const handleOrderSelect = (order) => {
    setOrderSearchInput(getOrderLabel(order));
    setOrderId(order._id);
    setShowOrderDropdown(false);
    setFilteredOrders([]);
  };

  const handleOrderInputBlur = () => {
    setTimeout(() => {
      setShowOrderDropdown(false);
    }, 200);
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
              <div style={{ display: 'flex', gap: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="transactionType"
                    value="income"
                    checked={transactionType === 'income'}
                    onChange={(e) => setTransactionType(e.target.value)}
                    disabled={isSubmitting}
                  />
                  <span>Income</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="transactionType"
                    value="expense"
                    checked={transactionType === 'expense'}
                    onChange={(e) => setTransactionType(e.target.value)}
                    disabled={isSubmitting}
                  />
                  <span>Expense</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Type Name</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  value={typeNameSearchInput}
                  onChange={handleTypeNameSearch}
                  onFocus={handleTypeNameFocus}
                  onBlur={handleTypeNameInputBlur}
                  placeholder="Click to see all types or type to search..."
                  disabled={isSubmitting || typeOptions.length === 0}
                  required
                  style={{ width: '100%' }}
                />
                {showTypeNameDropdown && filteredTypeNames.length > 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      background: 'var(--background-light)',
                      border: '1px solid var(--border-color)',
                      borderTop: 'none',
                      borderRadius: '0 0 var(--radius-md) var(--radius-md)',
                      maxHeight: '200px',
                      overflowY: 'auto',
                      zIndex: 1000,
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                      padding: '8px'
                    }}
                  >
                    {filteredTypeNames.map((typeNameValue) => (
                      <div
                        key={typeNameValue}
                        onClick={() => handleTypeNameSelect(typeNameValue)}
                        style={{
                          padding: '10px 12px',
                          cursor: 'pointer',
                          borderBottom: '1px solid var(--border-color)',
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = 'var(--primary-light)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'transparent';
                        }}
                      >
                        <div style={{ fontWeight: '500' }}>{typeNameValue}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  value={orderSearchInput}
                  onChange={handleOrderSearch}
                  onFocus={handleOrderFocus}
                  onBlur={handleOrderInputBlur}
                  placeholder="Click to see all orders or type to search..."
                  disabled={isSubmitting || orders.length === 0}
                  style={{ width: '100%' }}
                />
                {showOrderDropdown && filteredOrders.length > 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      background: 'var(--background-light)',
                      border: '1px solid var(--border-color)',
                      borderTop: 'none',
                      borderRadius: '0 0 var(--radius-md) var(--radius-md)',
                      maxHeight: '200px',
                      overflowY: 'auto',
                      zIndex: 1000,
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                      padding: '8px'
                    }}
                  >
                    {filteredOrders.map((order) => (
                      <div
                        key={order._id}
                        onClick={() => handleOrderSelect(order)}
                        style={{
                          padding: '10px 12px',
                          cursor: 'pointer',
                          borderBottom: '1px solid var(--border-color)',
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = 'var(--primary-light)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'transparent';
                        }}
                      >
                        <div style={{ fontWeight: '500' }}>{getOrderLabel(order)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {orders.length === 0 && (
                <p style={{ fontSize: '12px', color: 'var(--gray-color)', marginTop: '6px' }}>
                  No orders available.
                </p>
              )}
            </div>

            <div className='form-group'>
              <label className="form-label">Payment Type</label>
              <div style={{ display: 'flex', gap: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={paymentType === 'cash'}
                    onChange={(e) => setPaymentType(e.target.value)}
                    disabled={isSubmitting}
                  />
                  <span>Cash</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank"
                    checked={paymentType === 'bank'}
                    onChange={(e) => setPaymentType(e.target.value)}
                    disabled={isSubmitting}
                  />
                  <span>Bank</span>
                </label>
              </div>
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
              disabled={isSubmitting || !typeName || !amount}
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
