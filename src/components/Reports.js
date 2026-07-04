import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import '../styles.css';
import { storage } from '../utils/storage';
import { reportsAPI } from '../services/api';
import { FiEye } from 'react-icons/fi';

const Reports = ({ onLogout }) => {
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('fabric');
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

    const fetchFabricAnalytics = async () => {
        try {
            setLoading(true);
            setError('');

            const response =
                await reportsAPI.getFabricAnalytics({
                    search: '',
                    startdate: startDate,
                    enddate: endDate,
                });

            setReportData(
                Array.isArray(response) ? response : []
            );
        } catch (err) {
            setError(
                err.message || 'Failed to fetch fabric analytics'
            );
        } finally {
            setLoading(false);
        }
    };

    const fetchOutfitAnalytics = async () => {
        try {
            setLoading(true);
            setError('');

            const response =
                await reportsAPI.getOutfitAnalytics({
                    search: '',
                    startdate: startDate,
                    enddate: endDate,
                });

            setReportData(
                Array.isArray(response) ? response : []
            );
        } catch (err) {
            setError(
                err.message || 'Failed to fetch outfit analytics'
            );
        } finally {
            setLoading(false);
        }
    };

    const fetchWorktypeAnalytics = async () => {
        try {
            setLoading(true);
            setError('');

            const response =
                await reportsAPI.getWorktypeAnalytics({
                    search: '',
                    startdate: startDate,
                    enddate: endDate,
                });

            setReportData(Array.isArray(response) ? response : []);
        } catch (err) {
            setError(
                err.message || 'Failed to fetch worktype analytics'
            );
        } finally {
            setLoading(false);
        }
    };

    const fetchWorkerAnalytics = async () => {
        try {
            setLoading(true);
            setError('');

            const response =
                await reportsAPI.getWorkerAnalytics({
                    search: '',
                    startdate: startDate,
                    enddate: endDate,
                });

            setReportData(Array.isArray(response) ? response : []);
        } catch (err) {
            setError(
                err.message || 'Failed to fetch worker analytics'
            );
        } finally {
            setLoading(false);
        }
    };

    const fetchCustomerAnalytics = async () => {
        try {
            setLoading(true);
            setError('');

            const response =
                await reportsAPI.getCustomerAnalytics({
                    search: '',
                    startdate: startDate,
                    enddate: endDate,
                });

            setReportData(Array.isArray(response) ? response : []);
        } catch (err) {
            setError(
                err.message || 'Failed to fetch customer analytics'
            );
        } finally {
            setLoading(false);
        }
    };

    const fetchDeliveryAnalytics = async () => {
        try {
            setLoading(true);
            setError('');

            const response =
                await reportsAPI.getDeliveryAnalytics({
                    search: '',
                    startdate: startDate,
                    enddate: endDate,
                });

            setReportData(response || {});
        } catch (err) {
            setError(
                err.message || 'Failed to fetch delivery analytics'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        switch (activeTab) {
            case 'fabric':
                fetchFabricAnalytics();
                break;

            case 'outfit':
                fetchOutfitAnalytics();
                break;

            case 'worktype':
                fetchWorktypeAnalytics();
                break;

            case 'worker':
                fetchWorkerAnalytics();
                break;

            case 'customer':
                fetchCustomerAnalytics();
                break;

            case 'delivery':
                fetchDeliveryAnalytics();
                break;

            default:
                break;
        }
    }, [activeTab, startDate, endDate]);

    const handleLogout = () => {
        storage.clearAuthData();
        onLogout();
        navigate('/');
    };

    const [showModal, setShowModal] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);

    const handleView = (record) => {
        setSelectedRecord(record);
        setShowModal(true);
    };

    const closeModal = () => {
        setSelectedRecord(null);
        setShowModal(false);
    };

    return (
        <div className="settings-container">
            <Sidebar onLogout={handleLogout} />

            <div className="main-content">
                <div className="page-header">
                    <h1 className="page-title">Reports</h1>
                </div>

                {error && (
                    <div className="error-badge">
                        {error}
                    </div>
                )}

                <div className="content-section">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                        <label style={{ fontWeight: '600', color: 'var(--text-color)' }}>
                            Start Date
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                style={{ marginLeft: '8px', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                            />
                        </label>
                        <label style={{ fontWeight: '600', color: 'var(--text-color)' }}>
                            End Date
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                style={{ marginLeft: '8px', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                            />
                        </label>
                    </div>

                    {/* Tabs */}
                    <div className="tabs reports">
                        <button
                            className={`tab tab-button ${activeTab === 'fabric' ? 'active' : ''
                                }`}
                            onClick={() => setActiveTab('fabric')}
                        >
                            Fabric
                        </button>

                        <button
                            className={`tab tab-button ${activeTab === 'outfit' ? 'active' : ''
                                }`}
                            onClick={() => setActiveTab('outfit')}
                        >
                            Outfit
                        </button>

                        <button
                            className={`tab tab-button ${activeTab === 'worktype' ? 'active' : ''
                                }`}
                            onClick={() => setActiveTab('worktype')}
                        >
                            Work Type
                        </button>

                        <button
                            className={`tab tab-button ${activeTab === 'worker' ? 'active' : ''
                                }`}
                            onClick={() => setActiveTab('worker')}
                        >
                            Worker
                        </button>

                        <button
                            className={`tab tab-button ${activeTab === 'customer' ? 'active' : ''
                                }`}
                            onClick={() => setActiveTab('customer')}
                        >
                            Customer
                        </button>

                        <button
                            className={`tab tab-button ${activeTab === 'delivery' ? 'active' : ''
                                }`}
                            onClick={() => setActiveTab('delivery')}
                        >
                            Delivery
                        </button>
                    </div>

                    <div className="section-header">
                        <h2 className="section-title">
                            {activeTab === 'fabric'
                                ? 'Fabric Analytics'
                                : activeTab === 'outfit'
                                    ? 'Outfit Analytics'
                                    : activeTab === 'worktype'
                                        ? 'Work Type Analytics'
                                        : activeTab === 'worker'
                                            ? 'Worker Analytics'
                                            : activeTab === 'customer'
                                                ? 'Customer Analytics'
                                                : 'Delivery Analytics'}
                        </h2>
                    </div>

                    {loading ? (
                        <div
                            style={{
                                textAlign: 'center',
                                padding: '40px',
                            }}
                        >
                            Loading...
                        </div>
                    ) : (
                        activeTab === 'delivery'
                            ? Object.keys(reportData || {}).length > 0
                            : reportData.length > 0
                    ) ? (
                        <div className="table-container">
                            <div className="table-scroll-wrapper">
                                <table
                                    style={{
                                        width: '100%',
                                        borderCollapse: 'collapse',
                                    }}
                                >
                                    <thead>
                                        {activeTab === 'fabric' ? (
                                            <tr>
                                                <th>Fabric Name</th>
                                                <th>Orders</th>
                                                <th>Revenue</th>
                                                <th>Customers</th>
                                                <th>Average Revenue</th>
                                                <th>View</th>
                                            </tr>
                                        ) : activeTab === 'outfit' ? (
                                            <tr>
                                                <th>Outfit Name</th>
                                                <th>Orders</th>
                                                <th>Revenue</th>
                                                <th>Customers</th>
                                                <th>Average Revenue</th>
                                                <th>Average Time</th>
                                                <th>Repairing Rate</th>
                                                <th>Cancellation Rate</th>
                                                <th>View</th>
                                            </tr>
                                        ) : activeTab === 'worktype' ? (
                                            <tr>
                                                <th>Work Type</th>
                                                <th>No. Of Orders</th>
                                                <th>No. Of Customers</th>
                                                <th>Avg Work Time</th>
                                                <th>View</th>
                                            </tr>
                                        ) : activeTab === 'worker' ? (
                                            <tr>
                                                <th>Worker Name</th>
                                                <th>Assigned Orders</th>
                                                <th>Avg Complete Time</th>
                                                <th>Repairing Rate</th>
                                                <th>View</th>
                                            </tr>
                                        ) : activeTab === 'customer' ? (
                                            <tr>
                                                <th>Customer Name</th>
                                                <th>No. Of Orders</th>
                                                <th>Total Revenue</th>
                                                <th>Due Amount</th>
                                                <th>Avg Revenue / Order</th>
                                                <th>Repairing Rate</th>
                                                <th>Cancellation Rate</th>
                                                <th>View</th>
                                            </tr>
                                        ) : (
                                            <tr>
                                                <th>Total On Time Deliveries</th>
                                                <th>Total Delayed Deliveries</th>
                                                <th>On Time %</th>
                                                <th>Delayed %</th>
                                                <th>View</th>
                                            </tr>
                                        )}
                                    </thead>

                                    {activeTab === 'delivery' ? (
                                        <tbody>
                                            <tr>
                                                <td>{reportData.totalOnTimeDeliveries}</td>
                                                <td>{reportData.totalDelayedDeliveries}</td>
                                                <td>{reportData.onTimeDeliveryPercentage}%</td>
                                                <td>{reportData.delayedDeliveryPercentage}%</td>
                                            </tr>
                                        </tbody>
                                    ) : (
                                        <tbody>
                                            {reportData.map((item, index) => {
                                                if (activeTab === 'fabric') {
                                                    return (
                                                        <tr key={index}>
                                                            <td>{item.fabricName}</td>
                                                            <td>{item.noOfOrders}</td>
                                                            <td>₹ {item.totalRevenue}</td>
                                                            <td>{item.noOfCustomers}</td>
                                                            <td>₹ {item.avgRevenue}</td>
                                                            <td><button className="edit-btn" title="View" onClick={() => handleView(item)}><FiEye /></button></td>
                                                        </tr>
                                                    );
                                                }

                                                if (activeTab === 'outfit') {
                                                    return (
                                                        <tr key={index}>
                                                            <td>{item.outfitName}</td>
                                                            <td>{item.noOfOrders}</td>
                                                            <td>₹ {item.totalRevenue}</td>
                                                            <td>{item.noOfCustomers}</td>
                                                            <td>₹ {item.avgRevenue}</td>
                                                            <td>{item.avgOutfitTime}</td>
                                                            <td>
                                                                {item.repairPercentage
                                                                    ? `${item.repairPercentage}%`
                                                                    : '0%'}
                                                            </td>
                                                            <td>{item.cancelPercentage}%</td>
                                                            <td><button className="edit-btn" title="View" onClick={() => handleView(item)}><FiEye /></button></td>
                                                        </tr>
                                                    );
                                                }

                                                if (activeTab === 'worktype') {
                                                    return (
                                                        <tr key={index}>
                                                            <td>{item.workTypeName}</td>
                                                            <td>{item.noOfOrders}</td>
                                                            <td>{item.noOfCustomers}</td>
                                                            <td>{item.avgWorkTypeTime}</td>
                                                            <td><button className="edit-btn" title="View" onClick={() => handleView(item)}><FiEye /></button></td>
                                                        </tr>
                                                    );
                                                }

                                                if (activeTab === 'worker') {
                                                    return (
                                                        <tr key={index}>
                                                            <td>{item.workerName}</td>
                                                            <td>{item.noOfAssignedOrders}</td>
                                                            <td>{item.avgTimeToCompleteOrder}</td>
                                                            <td>{item.repairingRatePercentage}</td>
                                                            <td><button className="edit-btn" title="View" onClick={() => handleView(item)}><FiEye /></button></td>
                                                        </tr>
                                                    );
                                                }

                                                if (activeTab === 'customer') {
                                                    return (
                                                        <tr key={index}>
                                                            <td>{item.customerName}</td>
                                                            <td>{item.noOfOrders}</td>
                                                            <td>₹ {item.totalRevenue}</td>
                                                            <td>₹ {item.totalDueAmount}</td>
                                                            <td>₹ {item.avgRevenuePerOrder}</td>
                                                            <td>{item.repairingRatePercentage}%</td>
                                                            <td>{item.cancelPercentage}%</td>
                                                            <td>
                                                                <button
                                                                    className="edit-btn"
                                                                    title="View"
                                                                    onClick={() => handleView(item)}
                                                                >
                                                                    <FiEye />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                }

                                                return (
                                                    <tr key={index}>
                                                        <td>{item.deliveryType}</td>
                                                        <td>{item.noOfOrders}</td>
                                                        <td>₹ {item.totalRevenue}</td>
                                                        <td>{item.noOfCustomers}</td>
                                                        <td>₹ {item.avgRevenue}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    )}
                                    {/* <tbody>
                                        {reportData.map((item, index) =>
                                            activeTab === 'fabric' ? (
                                                <tr key={index}>
                                                    <td>{item.fabricName}</td>
                                                    <td>{item.noOfOrders}</td>
                                                    <td>₹ {item.totalRevenue}</td>
                                                    <td>{item.noOfCustomers}</td>
                                                    <td>₹ {item.avgRevenue}</td>
                                                </tr>
                                            ) : (
                                                <tr key={index}>
                                                    <td>{item.outfitName}</td>
                                                    <td>{item.noOfOrders}</td>
                                                    <td>₹ {item.totalRevenue}</td>
                                                    <td>{item.noOfCustomers}</td>
                                                    <td>₹ {item.avgRevenue}</td>
                                                    <td>{item.avgOutfitTime}</td>
                                                    <td>
                                                        {item.repairPercentage
                                                            ? `${item.repairPercentage}%`
                                                            : '0%'}
                                                    </td>
                                                    <td>{item.cancelPercentage}%</td>
                                                </tr>
                                            )
                                        )}
                                    </tbody> */}
                                </table>
                                {showModal && selectedRecord && (
                                    <div className="modal-overlay">
                                        <div
                                            className="modal-content"
                                            style={{
                                                maxWidth: '700px',
                                                width: '90%',
                                            }}
                                        >
                                            <div className="modal-header">
                                                <h3>
                                                    {activeTab === 'fabric'
                                                        ? 'Fabric Details'
                                                        : activeTab === 'outfit'
                                                            ? 'Outfit Details'
                                                            : activeTab === 'worktype'
                                                                ? 'Work Type Details'
                                                                : activeTab === 'worker'
                                                                    ? 'Worker Details'
                                                                    : activeTab === 'customer'
                                                                        ? 'Customer Details'
                                                                        : 'Delivery Details'}
                                                </h3>

                                                <button
                                                    onClick={closeModal}
                                                    style={{
                                                        border: 'none',
                                                        background: 'none',
                                                        fontSize: '20px',
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    ✕
                                                </button>
                                            </div>

                                            <div className="modal-body">
                                                {activeTab === 'fabric' && (
                                                    <>
                                                        <p>
                                                            <strong>Fabric Name:</strong>{' '}
                                                            {selectedRecord.fabricName}
                                                        </p>

                                                        <p>
                                                            <strong>No Of Orders:</strong>{' '}
                                                            {selectedRecord.noOfOrders}
                                                        </p>

                                                        <p>
                                                            <strong>No Of Customers:</strong>{' '}
                                                            {selectedRecord.noOfCustomers}
                                                        </p>

                                                        <p>
                                                            <strong>Total Revenue:</strong> ₹
                                                            {selectedRecord.totalRevenue}
                                                        </p>

                                                        <p>
                                                            <strong>Average Revenue:</strong> ₹
                                                            {selectedRecord.avgRevenue}
                                                        </p>
                                                    </>
                                                )}

                                                {activeTab === 'outfit' && (
                                                    <>
                                                        <p>
                                                            <strong>Outfit Name:</strong>{' '}
                                                            {selectedRecord.outfitName}
                                                        </p>

                                                        <p>
                                                            <strong>No Of Orders:</strong>{' '}
                                                            {selectedRecord.noOfOrders}
                                                        </p>

                                                        <p>
                                                            <strong>No Of Customers:</strong>{' '}
                                                            {selectedRecord.noOfCustomers}
                                                        </p>

                                                        <p>
                                                            <strong>Total Revenue:</strong> ₹
                                                            {selectedRecord.totalRevenue}
                                                        </p>

                                                        <p>
                                                            <strong>Average Revenue:</strong> ₹
                                                            {selectedRecord.avgRevenue}
                                                        </p>

                                                        <p>
                                                            <strong>Average Time:</strong>{' '}
                                                            {selectedRecord.avgOutfitTime}
                                                        </p>

                                                        <p>
                                                            <strong>Repair Rate:</strong>{' '}
                                                            {selectedRecord.repairPercentage}%
                                                        </p>

                                                        <p>
                                                            <strong>Cancel Rate:</strong>{' '}
                                                            {selectedRecord.cancelPercentage}%
                                                        </p>
                                                    </>
                                                )}

                                                {activeTab === 'worktype' && (
                                                    <>
                                                        <p>
                                                            <strong>Work Type:</strong>{' '}
                                                            {selectedRecord.workTypeName}
                                                        </p>

                                                        <p>
                                                            <strong>No Of Orders:</strong>{' '}
                                                            {selectedRecord.noOfOrders}
                                                        </p>

                                                        <p>
                                                            <strong>No Of Customers:</strong>{' '}
                                                            {selectedRecord.noOfCustomers}
                                                        </p>

                                                        <p>
                                                            <strong>Average Work Time:</strong>{' '}
                                                            {selectedRecord.avgWorkTypeTime}
                                                        </p>
                                                    </>
                                                )}

                                                {activeTab === 'worker' && (
                                                    <>
                                                        <p>
                                                            <strong>Worker Name:</strong>{' '}
                                                            {selectedRecord.workerName}
                                                        </p>

                                                        <p>
                                                            <strong>Assigned Orders:</strong>{' '}
                                                            {selectedRecord.noOfAssignedOrders}
                                                        </p>

                                                        <p>
                                                            <strong>Average Complete Time:</strong>{' '}
                                                            {selectedRecord.avgTimeToCompleteOrder}
                                                        </p>

                                                        <p>
                                                            <strong>Repairing Rate:</strong>{' '}
                                                            {selectedRecord.repairingRatePercentage}%
                                                        </p>

                                                        {/* <p>
                                                            <strong>Worker ID:</strong>{' '}
                                                            {selectedRecord.workerId}
                                                        </p> */}
                                                    </>
                                                )}

                                                {activeTab === 'customer' && (
                                                    <>
                                                        <p>
                                                            <strong>Customer Name:</strong>{' '}
                                                            {selectedRecord.customerName}
                                                        </p>

                                                        <p>
                                                            <strong>Customer ID:</strong>{' '}
                                                            {selectedRecord.customerId}
                                                        </p>

                                                        <p>
                                                            <strong>No Of Orders:</strong>{' '}
                                                            {selectedRecord.noOfOrders}
                                                        </p>

                                                        <p>
                                                            <strong>Total Revenue:</strong> ₹
                                                            {selectedRecord.totalRevenue}
                                                        </p>

                                                        <p>
                                                            <strong>Total Due Amount:</strong> ₹
                                                            {selectedRecord.totalDueAmount}
                                                        </p>

                                                        <p>
                                                            <strong>Average Revenue Per Order:</strong> ₹
                                                            {selectedRecord.avgRevenuePerOrder}
                                                        </p>

                                                        <p>
                                                            <strong>Repairing Rate:</strong>{' '}
                                                            {selectedRecord.repairingRatePercentage}%
                                                        </p>

                                                        <p>
                                                            <strong>Cancellation Rate:</strong>{' '}
                                                            {selectedRecord.cancelPercentage}%
                                                        </p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
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
                            No Records Found
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Reports;