import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import '../styles.css';
import { storage } from '../utils/storage';
import { expenseAlertAPI } from '../services/api';

const ExpenseAlert = ({ onLogout }) => {
  const navigate = useNavigate();

  const [expenseAlerts, setExpenseAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchExpenseAlerts = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await expenseAlertAPI.getExpenseAlerts('');

      setExpenseAlerts(
        Array.isArray(response) ? response : response || []
      );
    } catch (err) {
      console.error('Error fetching expense alerts:', err);

      setError(
        err.message || 'Failed to fetch expense alerts'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenseAlerts();
  }, []);

  const handleLogout = () => {
    storage.clearAuthData();
    onLogout();
    navigate('/');
  };

  return (
    <div className="settings-container">
      <Sidebar onLogout={handleLogout} />

      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">Expense Alert</h1>
        </div>

        {error && (
          <div className="error-badge">
            {error}
          </div>
        )}

        <div className="content-section">
          <div
            className="section-header"
            style={{
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <h2 className="section-title">
              Expense Alert List
            </h2>
          </div>

          {loading ? (
            <div
              style={{
                textAlign: 'center',
                padding: '40px',
                color: 'var(--primary-color)',
              }}
            >
              Loading expense alerts...
            </div>
          ) : expenseAlerts.length > 0 ? (
            <div className="table-container">
              <div className="table-scroll-wrapper">
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                  }}
                >
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Description</th>
                      <th>Amount</th>
                      <th>Due Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {expenseAlerts.map((item, index) => (
                      <tr
                        key={item._id || index}
                        style={{
                          borderBottom:
                            '1px solid var(--border-color)',
                        }}
                      >
                        <td>{item.name || '-'}</td>
                        <td>{item.description || '-'}</td>
                        <td>₹ {item.amount || 0}</td>
                        <td>{item.dueDate || '-'}</td>
                        <td>
                          {item.isPaid ? (
                            <span
                              style={{
                                color: 'green',
                                fontWeight: '600',
                              }}
                            >
                              Paid
                            </span>
                          ) : (
                            <span
                              style={{
                                color: 'orange',
                                fontWeight: '600',
                              }}
                            >
                              Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '60px',
                color: 'var(--gray-color)',
              }}
            >
              <p>No Expense Alerts Found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenseAlert;

