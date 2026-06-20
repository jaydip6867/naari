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

    useEffect(() => {
        if (activeTab === 'fabric') {
            fetchFabricAnalytics();
        } else {
            fetchOutfitAnalytics();
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
                    </div>

                    <div className="section-header">
                        <h2 className="section-title">
                            {activeTab === 'fabric'
                                ? 'Fabric Analytics'
                                : 'Outfit Analytics'}
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
                    ) : reportData.length > 0 ? (
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
                                                <th>Sales</th>
                                                <th>Revenue</th>
                                                <th>Customers</th>
                                                <th>Average Revenue</th>
                                            </tr>
                                        ) : (
                                            <tr>
                                                <th>Outfit Name</th>
                                                <th>Sales</th>
                                                <th>Revenue</th>
                                                <th>Customers</th>
                                                <th>Average Revenue</th>
                                                <th>Average Time</th>
                                                <th>Repairing Rate</th>
                                                <th>Cancellation Rate</th>
                                            </tr>
                                        )}
                                    </thead>

                                    <tbody>
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
                            No Records Found
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Reports;