import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import FinanceTypeModal from './FinanceTypeModal.js';
import FinanceTransactionModal from './FinanceTransactionModal.js';
import Sidebar from './Sidebar.js';
import '../styles.css';
import { storage } from '../utils/storage';
import {
    incomeTypeAPI,
    expenseTypeAPI,
    accountingAPI,
    orderAPI,
    bankDetailsAPI,
} from '../services/api';
import { FiEdit, FiTrash2, FiX } from 'react-icons/fi';
import { RxDragHandleDots2 } from 'react-icons/rx';

const Finance = ({ onLogout }) => {
    const navigate = useNavigate();

    // Finance state
    const [incomeTypes, setIncomeTypes] = useState([]);
    const [expenseTypes, setExpenseTypes] = useState([]);
    const [financeOrders, setFinanceOrders] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [financeLoading, setFinanceLoading] = useState(false);
    const [financeError, setFinanceError] = useState('');
    const [isFinanceTypeModalOpen, setIsFinanceTypeModalOpen] = useState(false);
    const [isFinanceTransactionModalOpen, setIsFinanceTransactionModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);

    // Bank State
    const [bankList, setBankList] = useState([]);
    const [bankLoading, setBankLoading] = useState(false);
    const [bankError, setBankError] = useState('');

    useEffect(() => {
        fetchFinanceData();
    }, []);


    const parseFinanceTypeList = (data) => {
        if (!data) return [];
        let list = Array.isArray(data) ? data : [];
        if (!Array.isArray(data) && typeof data === 'object') {
            list = Object.values(data).find(Array.isArray) || [];
        }
        return list
            .map((item) => {
                if (typeof item === 'string') return item;
                return item.name || item.title || item.typeName || '';
            })
            .filter(Boolean);
    };

    const parseTransactionList = (data) => {
        if (!data) return [];
        if (Array.isArray(data)) return data;
        if (Array.isArray(data.data)) return data.data;
        if (Array.isArray(data.list)) return data.list;
        if (Array.isArray(data.accountingList)) return data.accountingList;
        if (typeof data === 'object') {
            return Object.values(data).find(Array.isArray) || [];
        }
        return [];
    };

    const getTransactionOrderLabel = (transaction, orders) => {
        const orderRef = transaction.orderId;
        if (typeof orderRef === 'object' && orderRef !== null) {
            return orderRef.orderId || orderRef.orderName || orderRef._id || '-';
        }
        const matched = orders.find((o) => o._id === orderRef);
        if (matched) {
            return matched.orderId || matched.orderName || matched._id;
        }
        return orderRef || '-';
    };

    const fetchFinanceData = async () => {
        try {
            setFinanceLoading(true);
            setFinanceError('');
            const [incomeData, expenseData, ordersData, accountingData] = await Promise.all([
                incomeTypeAPI.getIncomeTypes(),
                expenseTypeAPI.getExpenseTypes(),
                orderAPI.getOrders(),
                accountingAPI.getAccountingList(),
            ]);
            setIncomeTypes(parseFinanceTypeList(incomeData));
            setExpenseTypes(parseFinanceTypeList(expenseData));
            const ordersList = Array.isArray(ordersData) ? ordersData : (ordersData?.data || []);
            setFinanceOrders(ordersList);
            setTransactions(parseTransactionList(accountingData));
        } catch (err) {
            console.error('Error fetching finance data:', err);
            setFinanceError(err.response.data.Message || 'Failed to fetch finance data');
        } finally {
            setFinanceLoading(false);
        }
    };


    const saveFinanceTransaction = async (transactionData) => {
        await accountingAPI.saveAccounting(transactionData);
        await fetchFinanceData();
    };

    const openFinanceTransactionModal = async () => {
        try {
            await fetchBankDetails();

            setEditingTransaction(null);
            setIsFinanceTransactionModalOpen(true);

        } catch (err) {
            console.error("Error opening transaction modal:", err);
        }
    };

    const openEditFinanceTransactionModal = async (transaction) => {
        
        try {
            await fetchBankDetails();   // માત્ર bank API call

            // પહેલા transaction state માં મૂકો
            setEditingTransaction(transaction);

            // પછી modal open કરો
            setIsFinanceTransactionModalOpen(true);

        } catch (err) {
            console.error("Error opening edit modal:", err);
        }
    };

    const closeFinanceTransactionModal = () => {
        setIsFinanceTransactionModalOpen(false);
        setEditingTransaction(null);
    };

    // Bank Details Management Functions
    const fetchBankDetails = async () => {
        try {
            setBankLoading(true);
            setBankError('');
            const banksData = await bankDetailsAPI.getBankDetails();
            setBankList(banksData || []);
        } catch (err) {
            console.error('Error fetching bank details:', err);
            setBankError(err.response.data.Message || 'Failed to fetch bank details');
        } finally {
            setBankLoading(false);
        }
    };



    const handleLogout = () => {
        storage.clearAuthData();
        onLogout();
        navigate('/');
    };

    return (
        <div className="settings-container">
            {/* Sidebar */}
            <Sidebar onLogout={handleLogout} />

            {/* Main Content */}
            <div className="main-content">
                <div className="page-header">
                    <h1 className="page-title">Settings</h1>
                </div>

                <div className="content-section">
                    <div className="section-header">
                        <h2 className="section-title">Finance</h2>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            <button
                                className="add-btn"
                                onClick={openFinanceTransactionModal}
                            >
                                + Add Transaction
                            </button>
                        </div>
                    </div>

                    {financeError && (
                        <div style={{
                            color: 'var(--alert-color)',
                            background: 'rgba(255, 0, 0, 0.1)',
                            padding: '12px',
                            borderRadius: 'var(--radius-md)',
                            marginBottom: '16px',
                            border: '1px solid rgba(255, 0, 0, 0.2)',
                        }}>
                            {financeError}
                        </div>
                    )}

                    {financeLoading ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--primary-color)' }}>
                            Loading finance data...
                        </div>
                    ) : (
                        <>
                            <div style={{ marginTop: '8px' }}>
                                <h3 style={{ margin: '0 0 16px', fontSize: '16px' }}>Transactions</h3>
                                {transactions.length > 0 ? (
                                    <div className="table-container" style={{ overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr style={{ background: 'var(--background-light)', borderBottom: '2px solid var(--border-color)' }}>
                                                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--primary-dark)' }}>Name</th>
                                                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--primary-dark)' }}>Type</th>
                                                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--primary-dark)' }}>Type Name</th>
                                                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--primary-dark)' }}>Order</th>
                                                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: 'var(--primary-dark)' }}>Date</th>
                                                    <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: 'var(--primary-dark)' }}>Amount</th>
                                                    <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: 'var(--primary-dark)' }}>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {transactions.map((transaction, index) => (
                                                    <tr key={transaction._id || index} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                        <td style={{ padding: '12px' }}>{transaction.name || '-'}</td>
                                                        <td style={{ padding: '12px', textTransform: 'capitalize' }}>{transaction.type || '-'}</td>
                                                        <td style={{ padding: '12px' }}>{transaction.typeName || '-'}</td>
                                                        <td style={{ padding: '12px' }}>{getTransactionOrderLabel(transaction, financeOrders)}</td>
                                                        <td style={{ padding: '12px' }}>{transaction.createdAt ? new Date(transaction.createdAt).toLocaleDateString('en-IN', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        }) : '-'}</td>
                                                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: '500' }}>
                                                            {transaction.amount != null ? Number(transaction.amount).toLocaleString('en-IN') : '-'}
                                                        </td>
                                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                                            <button
                                                                className="edit-btn"
                                                                onClick={() => openEditFinanceTransactionModal(transaction)}
                                                                title="Edit transaction"
                                                            >
                                                                <FiEdit />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p style={{ margin: 0, color: 'var(--gray-color)', fontSize: '14px' }}>No transactions yet.</p>
                                )}
                            </div>
                        </>
                    )}
                </div>


                <FinanceTransactionModal
                    isOpen={isFinanceTransactionModalOpen}
                    onClose={closeFinanceTransactionModal}
                    onSave={saveFinanceTransaction}
                    editingTransaction={editingTransaction}
                    incomeTypes={incomeTypes}
                    expenseTypes={expenseTypes}
                    orders={financeOrders}
                    bankList={bankList}
                    bankLoading={bankLoading}
                />
            </div>
        </div>
    );
};

export default Finance;
