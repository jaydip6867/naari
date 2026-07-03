import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import '../styles.css';
import { storage } from '../utils/storage';
import { legalAPI } from '../services/api';
import { FiDownload, FiEdit2 } from 'react-icons/fi';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Invoice = ({ onLogout }) => {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [legalList, setLegalList] = useState([]);

    const handleLogout = () => {
        storage.clearAuthData();
        onLogout();
        navigate('/');
    };

    useEffect(() => {
        fetchLegalList();
    }, []);

    const fetchLegalList = async () => {
        try {
            setLoading(true);
            setError('');

            const data = await legalAPI.getLegalList({}); // filter હોય તો અહીં આપજો

            console.log("Legal List Response :", data);

            setLegalList(data || []);
        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to fetch legal list');
        } finally {
            setLoading(false);
        }
    };

    const [showModal, setShowModal] = useState(false);

    const [editData, setEditData] = useState({
        _id: "",
        amount: "",
        percentage: "",
        bankdetailsid: "",
        orderId: "",
    });

    const handleEdit = (item) => {
        setEditData({
            _id: item._id,
            amount: item.amount,
            percentage: item.percentage,
            bankdetailsid: item.bankdetailsid?._id,
            orderId: item.orderId?._id,
        });

        setShowModal(true);
    };

    const handleUpdate = async () => {
        try {
            setLoading(true);

            const payload = {
                _id: editData._id,
                percentage: Number(editData.percentage),
                amount: Number(editData.amount),
                bankdetailsid: editData.bankdetailsid,
                orderId: editData.orderId,
            };

            await legalAPI.saveLegal(payload);

            setShowModal(false);

            fetchLegalList();
        } catch (err) {
            console.log(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = (data) => {
        const doc = new jsPDF("p", "mm", "a4");

        const order = data.orderId;
        const customer = order.customerId;

        const total = order.totalPrice;
        const advance = order.advanceAmount;
        const gst = data.amount;
        const subTotal = total + gst;
        const netDue = subTotal - advance;

        const primary = [236, 154, 120];

        // ======================
        // Header
        // ======================

        doc.setFont("helvetica", "bold");
        doc.setFontSize(20);
        doc.setTextColor(...primary);
        doc.text("Naari House", 14, 18);

        doc.setFontSize(10);
        doc.setTextColor(60);

        doc.text("24, Ugameshwar Bunglow", 14, 26);
        doc.text("Nr Taapi Arcade", 14, 32);
        doc.text("Nr Opel Gold", 14, 38);
        doc.text("Mota Varachha", 14, 44);
        doc.text("Surat - 394101", 14, 50);

        doc.setFontSize(22);
        doc.setTextColor(...primary);
        doc.text("INVOICE", 150, 18);

        doc.setFontSize(10);
        doc.setTextColor(0);

        doc.text(`Invoice No : ${data.legalid}`, 150, 28);
        doc.text(
            `Date : ${new Date(data.createdAt).toLocaleDateString()}`,
            150,
            34
        );
        doc.text(`Delivery : ${order.deliveryDate}`, 150, 40);

        doc.setDrawColor(...primary);
        doc.line(10, 58, 200, 58);

        // ======================
        // Bill To
        // ======================

        doc.setTextColor(...primary);
        doc.setFontSize(14);
        doc.text("BILL TO", 10, 76);

        doc.setFontSize(11);
        doc.setTextColor(0);

        doc.setFont("helvetica", "bold");
        doc.text(customer.fullName.toUpperCase(), 10, 84);

        doc.setFont("helvetica", "normal");
        doc.text(customer.mobile, 10, 90);

        // ======================
        // Item Table
        // ======================

        const rows = [];

        rows.push([
            1,
            "Fabric",
            1,
            `₹ ${order.fabricPurchasePrice}`,
            `₹ ${order.fabricPurchasePrice}`,
        ]);

        rows.push([
            2,
            "Embroidery",
            1,
            `₹ ${order.embroideryPrice}`,
            `₹ ${order.embroideryPrice}`,
        ]);

        rows.push([
            3,
            "Stitching",
            1,
            `₹ ${order.stitichingPrice}`,
            `₹ ${order.stitichingPrice}`,
        ]);

        rows.push([
            4,
            "Other Work",
            1,
            `₹ ${order.otherWorkPrice}`,
            `₹ ${order.otherWorkPrice}`,
        ]);

        autoTable(doc, {
            startY: 100,

            head: [["#", "Description", "Qty", "Unit Price", "Total"]],

            body: rows,

            headStyles: {
                fillColor: primary,
                textColor: 255,
                halign: "center",
            },

            bodyStyles: {
                fontSize: 10,
            },

            columnStyles: {
                0: { halign: "center", cellWidth: 15 },
                2: { halign: "center", cellWidth: 20 },
                3: { halign: "right" },
                4: { halign: "right" },
            },
        });

        // ======================
        // Summary Table
        // ======================

        autoTable(doc, {
            startY: doc.lastAutoTable.finalY + 18,

            margin: { left: 120 },

            body: [
                ["Total Amount", `₹ ${total}`],
                ["Discount", "₹ 0"],
                [`GST ${data.percentage}%`, `₹ ${gst}`],
                ["Sub Total", `₹ ${subTotal}`],
                ["Advance Paid", `₹ ${advance}`],
                ["Net Due", `₹ ${netDue}`],
            ],

            styles: {
                fontSize: 10,
            },

            columnStyles: {
                0: { fontStyle: "bold" },
                1: {
                    halign: "right",
                    fontStyle: "bold",
                },
            },
        });

        // ======================
        // Footer
        // ======================

        doc.setFontSize(10);
        doc.setTextColor(100);

        doc.text(
            "Thank you for your business.",
            14,
            doc.lastAutoTable.finalY + 20
        );

        doc.save(`Invoice-${data.legalid}.pdf`);
    };

    return (
        <div className="settings-container">
            <Sidebar onLogout={handleLogout} />

            <div className="main-content">
                <div className="page-header">
                    <h1 className="page-title">Invoice</h1>
                </div>

                <div className="content-section">

                    <h2 className="section-title">Invoice List</h2>
                    {loading && <p>Loading...</p>}
                    {error && <p style={{ color: 'red' }}>{error}</p>}

                    {!loading && (
                        <div className="table-container">
                            <div className="table-scroll-wrapper">
                                <table className="table table-bordered">
                                    <thead>
                                        <tr>
                                            <th>Legal ID</th>
                                            <th>Customer</th>
                                            <th>Mobile</th>
                                            <th>Product</th>
                                            <th>Amount</th>
                                            <th>GST %</th>
                                            <th>Total</th>
                                            <th>Status</th>
                                            <th width="170">Action</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {legalList.length > 0 ? (
                                            legalList.map((item) => (
                                                <tr key={item._id}>
                                                    <td>{item.legalid}</td>

                                                    <td>{item.orderId?.customerId?.fullName}</td>

                                                    <td>{item.orderId?.customerId?.mobile}</td>

                                                    <td>{item.orderId?.productName}</td>

                                                    <td>₹ {item.amount}</td>

                                                    <td>{item.percentage}%</td>

                                                    <td>
                                                        ₹
                                                        {(
                                                            Number(item.amount) +
                                                            (Number(item.amount) * Number(item.percentage)) /
                                                            100
                                                        ).toFixed(2)}
                                                    </td>

                                                    <td>{item.orderId?.status}</td>

                                                    <td>
                                                        <button
                                                            className="edit-btn"
                                                            onClick={() => handleEdit(item)}
                                                        >
                                                            <FiEdit2 />
                                                        </button>

                                                        <button
                                                            className="edit-btn download-btn"
                                                            onClick={() => handleDownload(item)}
                                                        >
                                                            <FiDownload />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="9" className="text-center">
                                                    No Data Found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h2 className="modal-title">Edit Invoice</h2>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Amount</label>

                                <input
                                    type="number"
                                    className="form-input"
                                    value={editData.amount}
                                    onChange={(e) =>
                                        setEditData({
                                            ...editData,
                                            amount: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="form-group mt-3">
                                <label>GST %</label>

                                <input
                                    type="number"
                                    className="form-input"
                                    value={editData.percentage}
                                    onChange={(e) =>
                                        setEditData({
                                            ...editData,
                                            percentage: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>
                        <div className="modal-footer">

                            <button
                                className="btn"
                                onClick={() => setShowModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-save"
                                onClick={handleUpdate}
                            >
                                Save
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default Invoice;