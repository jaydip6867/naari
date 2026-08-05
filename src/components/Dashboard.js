import React, { useEffect, useMemo, useState } from "react";
import { orderAPI } from "../services/api"; // તમારી path પ્રમાણે
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import "../styles.css";
import { storage } from "../utils/storage";
import { FaExclamationTriangle, FaShoppingCart, FaTruck, FaCalendarAlt } from "react-icons/fa";

const Dashboard = ({ onLogout }) => {
  const navigate = useNavigate();

  const user = storage.getUser();

  const handleLogout = () => {
    storage.clearAuthData();
    onLogout();
    navigate("/");
  };

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeWidget, setActiveWidget] = useState("todayOrders");

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);

      const data = await orderAPI.getOrders();
      setOrders(data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // આજની તારીખ (સમય વગર)
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  // Today's Orders
  const todayOrders = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];

    return orders.filter(
      (item) => item.createdAt?.slice(0, 10) === todayStr
    );
  }, [orders]);

  // Delivery Pending (આજ સુધી deliver થવું જોઈએ)
  const deliveries = useMemo(() => {
    return orders.filter((item) => {
      const deliveryDate = new Date(item.deliveryDate);

      return (
        deliveryDate <= today &&
        !["completed", "delivered", "cancelled"].includes(
          item.status?.toLowerCase()
        )
      );
    });
  }, [orders]);

  // Overdue (Delivery Date પસાર થઈ ગઈ છે)
  const overdue = useMemo(() => {
    return orders.filter((item) => {
      const deliveryDate = new Date(item.deliveryDate);

      return (
        deliveryDate < today &&
        !["cancelled"].includes(item.status?.toLowerCase())
      );
    });
  }, [orders]);

  // Upcoming Orders (Next 7 Days Deliveries)
  const upcomingOrders = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const next7Days = new Date();
    next7Days.setDate(next7Days.getDate() + 7);
    next7Days.setHours(23, 59, 59, 999);

    return orders.filter((item) => {
      const deliveryDate = new Date(item.deliveryDate);

      return (
        deliveryDate >= today &&
        deliveryDate <= next7Days &&
        !["completed", "delivered", "cancelled"].includes(
          item.status?.toLowerCase()
        )
      );
    });
  }, [orders]);

  const getData = () => {
    switch (activeWidget) {
      case "todayOrders":
        return todayOrders;

      case "deliveries":
        return deliveries;

      case "overdue":
        return overdue;

      case "upcoming":
        return upcomingOrders;

      default:
        return [];
    }
  };


  return (
    <div className="settings-container">
      <Sidebar onLogout={handleLogout} />

      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">Dashboard</h1>
        </div>

        <div className="content-section">
          <h2 className="section-title">
            Welcome, {user?.fullName || "User"}!
          </h2>

          {/* Widgets */}
          <div className="dashboard-cards">
            <div
              className={`dashboard-card ${activeWidget === "todayOrders" ? "active-card" : ""
                }`}
              onClick={() => setActiveWidget("todayOrders")}
            >
              <div>
                <h4>Today's Orders</h4>
                <h2>{todayOrders.length}</h2>
              </div>
              <FaShoppingCart className="card-icon" />
            </div>

            <div
              className={`dashboard-card ${activeWidget === "deliveries" ? "active-card" : ""
                }`}
              onClick={() => setActiveWidget("deliveries")}
            >
              <div>
                <h4>Delivery</h4>
                <h2>{deliveries.length}</h2>
              </div>
              <FaTruck className="card-icon" />
            </div>

            <div
              className={`dashboard-card ${activeWidget === "overdue" ? "active-card" : ""
                }`}
              onClick={() => setActiveWidget("overdue")}
            >
              <div>
                <h4>Overdue</h4>
                <h2>{overdue.length}</h2>
              </div>
              <FaExclamationTriangle className="card-icon" />
            </div>

            <div
              className={`dashboard-card ${activeWidget === "upcoming" ? "active-card" : ""
                }`}
              onClick={() => setActiveWidget("upcoming")}
            >
              <div>
                <h4>Upcoming Orders</h4>
                <h2>{upcomingOrders.length}</h2>
              </div>
              <FaCalendarAlt className="card-icon" />
            </div>
          </div>
          {/* Table */}
          <div className="table-container">
            <h3 style={{ marginBottom: "15px" }}>
              {activeWidget === "todayOrders" && "Today's Orders"}
              {activeWidget === "deliveries" && "Delivery List"}
              {activeWidget === "overdue" && "Overdue List"}
              {activeWidget === "upcoming" && "Upcoming Orders"}
            </h3>
            <table className="dashboard-table">
              <thead>
                {activeWidget === "todayOrders" && (
                  <tr>
                    <th>Order No</th>
                    <th>Customer</th>
                    <th>Outfit</th>
                    <th>Delivery Date</th>
                    <th>Status</th>
                    <th>Due Total</th>
                  </tr>
                )}
                {activeWidget === "deliveries" && (
                  <tr>
                    <th>Order No</th>
                    <th>Customer</th>
                    <th>Outfit</th>
                    <th>Delivery Date</th>
                    <th>Status</th>
                    <th>Due Total</th>
                  </tr>
                )}
                {activeWidget === "overdue" && (
                  <tr>
                    <th>Order No</th>
                    <th>Customer</th>
                    <th>Outfit</th>
                    <th>Delivery Date</th>
                    <th>Status</th>
                    <th>Due Total</th>
                  </tr>
                )}
                {activeWidget === "upcoming" && (
                  <tr>
                    <th>Order No</th>
                    <th>Customer</th>
                    <th>Outfit</th>
                    <th>Delivery Date</th>
                    <th>Status</th>
                    <th>Due Total</th>
                  </tr>
                )}
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" align="center">
                      Loading...
                    </td>
                  </tr>
                ) : getData().length === 0 ? (
                  <tr>
                    <td colSpan="6" align="center">
                      No Data Found
                    </td>
                  </tr>
                ) : (
                  getData().map((item) => (
                    <tr key={item._id}>
                      <td ><Link to={`/orders/view/${item._id}`} className="link">{item.orderId}</Link></td>
                      <td>{item.customerId?.fullName}</td>
                      <td>{item.outfitTypeName}</td>
                      <td>{item.deliveryDate}</td>
                      <td>
                        <span className={`status ${item.status?.toLowerCase()}`}>
                          {item.status}
                        </span>
                      </td>
                      <td>₹ {item.sellingPrice - item.advanceAmount}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


{/* <div style={{ marginBottom: '20px' }}>
            <p><strong>User ID:</strong> {user?.userId}</p>
            <p><strong>Role:</strong> {storage.getUserRole()}</p>
            <p><strong>Status:</strong> {user?.status ? 'Active' : 'Inactive'}</p>
          </div>

          <div className="section-title">Your Permissions</div>
{
  permissions && permissions.length > 0 ? (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
      {permissions.map((permission, index) => (
        <div key={index} style={{
          padding: '16px',
          background: 'var(--background-light)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)'
        }}>
          <h4 style={{ margin: '0 0 8px 0', color: 'var(--primary-color)' }}>
            {permission.displayname}
          </h4>
          <div style={{ fontSize: '14px', color: 'var(--gray-color)' }}>
            <div>👁️ View: {permission.view ? '✅' : '❌'}</div>
            <div>✏️ Add/Edit: {permission.insertUpdate ? '✅' : '❌'}</div>
            <div>🗑️ Delete: {permission.delete ? '✅' : '❌'}</div>
          </div>
        </div>
      ))}
    </div>
  ) : (
  <p>No permissions available</p>
)
}

<div style={{ marginTop: '24px' }}>
  <h3 className="section-title">Quick Actions</h3>
  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
    {storage.hasPermission('orders', 'view') && (
      <button
        className="add-btn"
        onClick={() => console.log('Navigate to orders')}
      >
        View Orders
      </button>
    )}
    {storage.hasPermission('users', 'insertUpdate') && (
      <button
        className="add-btn"
        onClick={() => console.log('Navigate to users')}
      >
        Manage Users
      </button>
    )}
    {storage.hasPermission('measurements', 'view') && (
      <button
        className="add-btn"
        onClick={() => navigate('/settings')}
      >
        Manage Measurements
      </button>
    )}
  </div>
</div> */}