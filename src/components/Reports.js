import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import '../styles.css';
import { storage } from '../utils/storage';
import { reportsAPI } from '../services/api';

const Reports = ({ onLogout }) => {
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('fabric');
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchFabricAnalytics = async () => {
        try {
            setLoading(true);
            setError('');

            const response =
                await reportsAPI.getFabricAnalytics({
                    search: '',
                    startdate: '2026-03-01',
                    enddate: '2026-06-30',
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
                    startdate: '2026-03-01',
                    enddate: '2026-06-30',
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
                    startdate: '2026-03-01',
                    enddate: '2026-06-30',
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
                    startdate: '2026-03-01',
                    enddate: '2026-06-30',
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

    const fetchDeliveryAnalytics = async () => {
        try {
            setLoading(true);
            setError('');

            const response =
                await reportsAPI.getDeliveryAnalytics({
                    search: '',
                    startdate: '2026-03-01',
                    enddate: '2026-06-30',
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

            case 'delivery':
                fetchDeliveryAnalytics();
                break;

            default:
                break;
        }
    }, [activeTab]);

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
                    <h1 className="page-title">Reports</h1>
                </div>

                {error && (
                    <div className="error-badge">
                        {error}
                    </div>
                )}

                <div className="content-section">
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
                                            </tr>
                                        ) : activeTab === 'worktype' ? (
                                            <tr>
                                                <th>Work Type</th>
                                                <th>No. Of Orders</th>
                                                <th>No. Of Customers</th>
                                                <th>Avg Work Time</th>
                                            </tr>
                                        ) : activeTab === 'worker' ? (
                                            <tr>
                                                <th>Worker Name</th>
                                                <th>Assigned Orders</th>
                                                <th>Avg Complete Time</th>
                                                <th>Repairing Rate</th>
                                            </tr>
                                        ) : (
                                            <tr>
                                                <th>Total On Time Deliveries</th>
                                                <th>Total Delayed Deliveries</th>
                                                <th>On Time %</th>
                                                <th>Delayed %</th>
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