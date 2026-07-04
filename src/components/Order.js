import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar.js';
import '../styles.css';
import { storage } from '../utils/storage';
import { orderAPI, bankDetailsAPI, legalAPI } from "../services/api";
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiEye, FiPackage, FiDownload } from 'react-icons/fi';
import Pagination from './Pagination.js';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


const Order = ({ onLogout }) => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]); // Store all orders for filtering
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  });


  const [bankList, setBankList] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchBanks = async () => {
    try {
      const res = await bankDetailsAPI.getBankDetails();
      setBankList(res || []);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await orderAPI.getOrders(); // Fetch all orders without search
      const ordersData = Array.isArray(response) ? response : (response || []);
      setAllOrders(ordersData); // Store all orders
      setOrders(ordersData); // Initially display all orders
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.response.data.Message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchBanks();
  }, []);


  // legal pdf generate & invoice API call
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [legalType, setLegalType] = useState("quotation");

  const [invoiceAmount, setInvoiceAmount] = useState(0);
  const [gstPercentage, setGstPercentage] = useState("");
  const [selectedBank, setSelectedBank] = useState("");

  const handleLegalSubmit = async () => {
    if (!selectedOrder) return;

    try {
      if (legalType === "quotation") {
        generateQuotationPDF(selectedOrder);

        setShowLegalModal(false);
        return;
      }

      if (!gstPercentage) {
        alert("Please select GST Percentage");
        return;
      }

      if (!selectedBank) {
        alert("Please select Bank");
        return;
      }

      console.log(selectedOrder);

      const payload = {
        percentage: Number(gstPercentage),
        amount: Number(invoiceAmount),
        bankdetailsid: selectedBank,
        orderId: selectedOrder._id,
      };

      await legalAPI.saveLegal(payload);

      alert("Invoice created successfully");

      setShowLegalModal(false);
      fetchOrders();

    } catch (err) {
      console.error(err);
      alert(err.message || "Something went wrong");
    }
  };

  const generateQuotationPDF = (order) => {
    const doc = new jsPDF("p", "mm", "a4");

    // ================= HEADER =================

    doc.setFont("helvetica", "bold");
    doc.setTextColor(226, 155, 125);
    doc.setFontSize(22);
    doc.text("Naari House", 15, 18);

    doc.setTextColor(0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    doc.text("24, Ugameshwar Bunglow", 15, 26);
    doc.text("Nr Taapi Arcade", 15, 32);
    doc.text("Nr Opel Gold", 15, 38);
    doc.text("Mota Varachha", 15, 44);
    doc.text("Surat - 394101", 15, 50);

    // ================= RIGHT =================

    doc.setTextColor(226, 155, 125);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("QUOTATION", 195, 18, { align: "right" });

    doc.setTextColor(0);
    doc.setFontSize(10);

    doc.text(`Quotation No : ${order.orderId}`, 195, 28, {
      align: "right",
    });

    doc.text(
      `Date : ${new Date(order.createdAt).toLocaleDateString("en-GB")}`,
      195,
      34,
      { align: "right" }
    );

    doc.text(
      `Delivery : ${new Date(order.deliveryDate).toLocaleDateString("en-GB")}`,
      195,
      40,
      { align: "right" }
    );

    doc.line(10, 56, 200, 56);

    // ================= CUSTOMER =================

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Customer Details", 15, 66);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    doc.text(`Name : ${order.customerId?.fullName}`, 15, 74);
    doc.text(`Mobile : ${order.customerId?.mobile}`, 15, 80);
    doc.text(`Address : ${order.customerId?.address}`, 15, 86);

    // ================= TABLE =================

    const rows = [];

    const addRow = (title, price) => {
      if (Number(price) > 0) {
        rows.push([
          rows.length + 1,
          title,
          1,
          `${price}`,
          `${price}`,
        ]);
      }
    };

    addRow("Fabric Purchase", order.fabricPurchasePrice);
    addRow("Dyeing", order.dyeingPrice);
    addRow("Embroidery", order.embroideryPrice);
    addRow("Stitching", order.stitichingPrice);
    addRow("Other Work", order.otherWorkPrice);
    addRow("Packing", order.packingPrice);
    addRow("Fusing", order.fusingPrice);
    addRow("Khakha", order.khakhaPrice);
    addRow("Art Work", order.artWorkPrice);

    autoTable(doc, {
      startY: 95,
      head: [["#", "Description", "Qty", "Unit Price", "Total"]],
      body: rows,
      theme: "grid",
      headStyles: {
        fillColor: [226, 155, 125],
        textColor: [255, 255, 255],
        halign: "center",
      },
      styles: {
        fontSize: 10,
        halign: "center",
      },
      columnStyles: {
        1: {
          halign: "left",
        },
      },
    });

    // ================= SUMMARY =================

    const finalY = doc.lastAutoTable.finalY + 10;

    const subTotal = Number(order.totalPrice);
    const sellingPrice = Number(order.sellingPrice);
    const advance = Number(order.advanceAmount);
    const netDue = sellingPrice - advance;

    autoTable(doc, {
      startY: finalY,
      margin: {
        left: 120,
      },
      body: [
        ["Sub Total", `${subTotal}`],
        ["Selling Price", `${sellingPrice}`],
        ["Advance Paid", `${advance}`],
        ["Net Due", `${netDue}`],
      ],
      theme: "grid",
      styles: {
        fontSize: 10,
      },
      columnStyles: {
        0: {
          fontStyle: "bold",
        },
        1: {
          halign: "right",
        },
      },
    });

    // ================= FOOTER =================

    const footerY = doc.lastAutoTable.finalY + 20;

    doc.setFont("helvetica", "italic");
    doc.text(
      `Created By : ${order.createdBy?.fullName}`,
      15,
      285
    );

    doc.save(`Quotation_${order.orderId}.pdf`);
  };

  // local permission get logic start

  const permissions = JSON.parse(localStorage.getItem("naari_permissions")) || [];

  const orderPermission = permissions.find(
    (item) => item.collectionName === "orders"
  );

  const canAddEdit = orderPermission?.insertUpdate || false;
  // const canView = orderPermission?.view || false;
  const canDelete = orderPermission?.delete || false;

  // console.log(orderPermission)

  // sorting function
  const handleSort = (key) => {
    let direction = "asc";

    if (
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }

    setSortConfig({ key, direction });

    const sortedOrders = [...orders].sort((a, b) => {
      let valueA;
      let valueB;

      switch (key) {
        case "orderId":
          valueA = a.orderId || "";
          valueB = b.orderId || "";
          break;

        case "customer":
          valueA =
            typeof a.customerId === "object"
              ? a.customerId?.fullName || ""
              : a.customerId || "";
          valueB =
            typeof b.customerId === "object"
              ? b.customerId?.fullName || ""
              : b.customerId || "";
          break;

        case "orderType":
          valueA = a.orderType || "";
          valueB = b.orderType || "";
          break;

        case "status":
          valueA = a.status || "";
          valueB = b.status || "";
          break;

        case "createdAt":
          valueA = new Date(a.createdAt || 0);
          valueB = new Date(b.createdAt || 0);
          break;

        case "deliveryDate":
          valueA = new Date(a.deliveryDate || 0);
          valueB = new Date(b.deliveryDate || 0);
          break;

        default:
          return 0;
      }

      if (valueA < valueB) {
        return direction === "asc" ? -1 : 1;
      }
      if (valueA > valueB) {
        return direction === "asc" ? 1 : -1;
      }
      return 0;
    });

    setOrders(sortedOrders);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return "⇅";
    return sortConfig.direction === "asc" ? "↑" : "↓";
  };

  const sortedOrders = useMemo(() => {
    let sortableOrders = [...orders];

    if (sortConfig.key) {
      sortableOrders.sort((a, b) => {
        // sorting logic
      });
    }

    return sortableOrders;
  }, [orders, sortConfig]);

  // local permission get logic end

  const handleSearch = (e) => {
    e.preventDefault();
    const query = e.target.value;
    setSearchQuery(query);
    setCurrentPage(1);
    // Filter orders locally
    if (!query.trim()) {
      setOrders(allOrders); // Show all orders if search is empty
    } else {
      const filteredOrders = allOrders.filter(order => {
        const searchLower = query.toLowerCase();
        return (
          (order.orderId && order.orderId.toLowerCase().includes(searchLower)) ||
          (order.customerId && order.customerId.fullName && order.customerId.fullName.toLowerCase().includes(searchLower)) ||
          (order.orderType && order.orderType.toLowerCase().includes(searchLower)) ||
          (order.status && order.status.toLowerCase().includes(searchLower))
        );
      });
      setOrders(filteredOrders);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) {
      return;
    }

    try {
      setLoading(true);
      await orderAPI.cancelOrder(orderId);
      fetchOrders(); // Refresh orders after deletion
    } catch (err) {
      console.error('Error deleting order:', err);
      alert(err.response.data.Message || 'Failed to delete order');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    storage.clearAuthData();
    onLogout();
    navigate('/');
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      'pending': { background: '#fef3c7', color: '#92400e' },
      'in-progress': { background: '#dbeafe', color: '#1e40af' },
      'completed': { background: '#d1fae5', color: '#065f46' },
      'cancelled': { background: '#fee2e2', color: '#991b1b' }
    };
    const style = statusStyles[status?.toLowerCase()] || statusStyles['pending'];
    return (
      <span style={{ ...style, padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '500', textTransform: 'capitalize' }}>
        {status || 'Pending'}
      </span>
    );
  };

  // pagination logic
  const indexOfLastOrder = currentPage * itemsPerPage;
  const indexOfFirstOrder = indexOfLastOrder - itemsPerPage;

  const currentOrders = sortedOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );

  const totalPages = Math.ceil(
    orders.length / itemsPerPage
  );

  return (
    <div className="settings-container">
      <Sidebar onLogout={handleLogout} />

      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">Order Management</h1>
        </div>

        {error && (
          <div style={{
            color: 'var(--alert-color)',
            background: 'rgba(255, 0, 0, 0.1)',
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '16px',
            border: '1px solid rgba(255, 0, 0, 0.2)'
          }}>
            {error}
          </div>
        )}


        <div className="content-section">
          <div className="section-header" style={{ flexWrap: 'wrap', gap: '16px' }}>
            <h2 className="section-title">Orders</h2>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', flex: 1, justifyContent: 'flex-end' }}>
              <div className="search-container" style={{ position: 'relative' }}>
                <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-color)' }} />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={handleSearch}
                  style={{
                    padding: '8px 12px 8px 36px',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '14px',
                    width: '200px'
                  }}
                />
              </div>
              <button
                className="add-btn"
                onClick={() => navigate('/orders/add')}
              >
                <FiPlus /> Add Order
              </button>
            </div>
          </div>


          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--primary-color)' }}>
              Loading orders...
            </div>
          ) : orders.length > 0 ? (
            <div className="table-container">
              <div className="table-scroll-wrapper">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th>Image</th>

                      <th
                        onClick={() => handleSort("orderId")}
                        style={{ cursor: "pointer" }}
                      >
                        Order ID {getSortIcon("orderId")}
                      </th>

                      <th
                        onClick={() => handleSort("createdAt")}
                        style={{ cursor: "pointer" }}
                      >
                        Order Date {getSortIcon("createdAt")}
                      </th>

                      <th
                        onClick={() => handleSort("customer")}
                        style={{ cursor: "pointer" }}
                      >
                        Customer {getSortIcon("customer")}
                      </th>

                      <th
                        onClick={() => handleSort("orderType")}
                        style={{ cursor: "pointer" }}
                      >
                        Order Type {getSortIcon("orderType")}
                      </th>

                      <th
                        onClick={() => handleSort("status")}
                        style={{ cursor: "pointer" }}
                      >
                        Status {getSortIcon("status")}
                      </th>

                      <th
                        onClick={() => handleSort("deliveryDate")}
                        style={{ cursor: "pointer" }}
                      >
                        Delivery Date {getSortIcon("deliveryDate")}
                      </th>

                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentOrders.map((order, index) => (
                      <tr key={order._id || index} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td >
                          <div style={{ width: '50px', height: '50px', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background-light)', border: '1px solid var(--border-color)' }}>
                            {order.outfitStyleRefImg && order.outfitStyleRefImg.length > 0 ? (
                              <img
                                src={order.outfitStyleRefImg[0]}
                                alt={order._id}
                                style={{ width: '100%', height: '100%' }}
                              />
                            ) : (
                              <FiPackage size={24} color="var(--gray-color)" />
                            )}
                          </div>
                        </td>
                        <td >{order.orderId || '-'}</td>
                        <td >
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          }) : '-'}
                        </td>
                        <td >
                          {typeof order.customerId === 'object' && order.customerId !== null
                            ? (order.customerId.fullName || order.customerId.name || '-')
                            : (order.customerId || '-')}
                        </td>
                        <td style={{ padding: '12px', textTransform: 'capitalize' }}>{order.orderType || '-'}</td>
                        <td >{getStatusBadge(order.status)}</td>
                        <td >
                          {/* {order.deliveryDate || '-'} */}
                          {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          }) : '-'}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              className="edit-btn"
                              onClick={() => navigate(`/orders/view/${order._id}`)}
                              title="View"
                            >
                              <FiEye />
                            </button>

                            {canAddEdit && order.status !== 'cancelled' && (<button
                              className="edit-btn"
                              onClick={() => navigate(`/orders/edit/${order._id}`)}
                              title="Edit"
                            >
                              <FiEdit2 />
                            </button>
                            )}
                            {canDelete && order.status !== 'cancelled' && (
                              <button
                                className="delete-btn"
                                onClick={() => handleCancelOrder(order._id)}
                                title="Delete"
                              >
                                <FiTrash2 />
                              </button>
                            )}
                            {canDelete &&
                              order.status !== "cancelled" && (
                                <button
                                  className="edit-btn download-btn"
                                  onClick={() => {
                                    setSelectedOrder(order);
                                    setLegalType("quotation");
                                    setGstPercentage("");
                                    setSelectedBank("");
                                    setShowLegalModal(true);
                                    console.log("Selected Order:", order); // Log the selected order
                                  }}
                                >
                                  <FiDownload />
                                </button>
                              )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--gray-color)' }}>
              <p>No orders found</p>
              <button
                className="add-btn"
                onClick={() => navigate('/orders/add')}
                style={{ marginTop: '16px' }}
              >
                <FiPlus /> Add Your First Order
              </button>
            </div>
          )}
        </div>
      </div>
      {showLegalModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Generate Invoice</h2>
            </div>

            <div className="modal-body">

              <div className="mb-3">
                <label>
                  <input
                    type="radio"
                    value="quotation"
                    checked={legalType === "quotation"}
                    onChange={(e) => setLegalType(e.target.value)}
                  />
                  Quotation
                </label>

                {selectedOrder && selectedOrder.legal_created == false ? (
                  <>
                    <label style={{ marginLeft: "20px" }}>
                      <input
                        type="radio"
                        value="invoice"
                        checked={legalType === "invoice"}
                        onChange={(e) => setLegalType(e.target.value)}
                      />
                      Invoice
                    </label>
                  </>
                ) : <div className='theme-color' style={{ marginTop: "12px" }}>Legal document already created for this order. <br /> <Link className='link underline' to={'/invoice'}>Click Here</Link> for show Legal Invoice</div>}

              </div>

              {legalType === "invoice" && (
                <>
                  <div className="form-group" style={{ marginTop: "12px" }}>
                    <label>Amount</label>

                    <input
                      type="number"
                      className="form-input"
                      placeholder="Enter Amount"
                      value={invoiceAmount}
                      onChange={(e) => setInvoiceAmount(e.target.value)}
                      min="0"
                      max="100"
                    />
                  </div>
                  <div className="form-group" style={{ marginTop: "12px" }}>
                    <label>GST Percentage</label>

                    <input
                      type="number"
                      className="form-input"
                      placeholder="Enter GST %"
                      value={gstPercentage}
                      onChange={(e) => setGstPercentage(e.target.value)}
                      min="0"
                      max="100"
                    />
                  </div>

                  <div className="form-group" style={{ marginTop: "12px" }}>
                    <label>Bank</label>

                    <select
                      className="form-input"
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                    >
                      <option value="">Select Bank</option>

                      {bankList.map((bank) => (
                        <option key={bank._id} value={bank._id}>
                          {bank.bankName}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>

            <div className="modal-footer">
              <button onClick={() => setShowLegalModal(false)} className="btn btn-cancel">
                Cancel
              </button>

              <button onClick={handleLegalSubmit} className="btn btn-save">
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Order;
