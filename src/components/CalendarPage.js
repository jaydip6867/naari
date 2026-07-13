import React, { useEffect, useMemo, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { orderAPI, expenseAlertAPI, accountingAPI } from '../services/api';
import { storage } from '../utils/storage';
import '../styles.css';

const CalendarPage = ({ onLogout }) => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadCalendarData();
  }, []);

  const loadCalendarData = async () => {
    try {
      setLoading(true);
      const [ordersData, alertsData, accountingData] = await Promise.all([
        orderAPI.getOrders(),
        expenseAlertAPI.getExpenseAlerts(),
        accountingAPI.getAccountingList(),
      ]);

      setOrders(Array.isArray(ordersData) ? ordersData : ordersData?.data || []);
      setAlerts(Array.isArray(alertsData) ? alertsData : alertsData?.data || []);
      setPayments(Array.isArray(accountingData) ? accountingData : accountingData?.data || []);
    } catch (error) {
      console.error('Error loading calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    storage.clearAuthData();
    onLogout();
    navigate('/');
  };

  const formatDateValue = (value) => {
    if (!value) return '';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return '';
    return parsed.toISOString().slice(0, 10);
  };

  const formatDisplayDate = (value) => {
    if (!value) return 'No date';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const events = useMemo(() => {
    return orders
      .filter((order) => order.deliveryDate || order.createdAt)
      .map((order) => ({
        id: order._id || order.id,
        title: order.orderId || order.orderName || 'Order',
        start: order.deliveryDate || order.createdAt,
        allDay: true,
        backgroundColor: '#EA9D81',
        borderColor: '#EA9D81',
        extendedProps: {
          customerName: order.customerId?.fullName || order.customerName || 'Customer',
          orderId: order.orderId || order._id,
        },
      }));
  }, [orders]);

  const openDateModal = (dateValue) => {
    setSelectedDate(formatDateValue(dateValue));
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDate('');
  };

  const selectedOrders = useMemo(() => {
    if (!selectedDate) return [];
    return orders.filter((order) => formatDateValue(order.deliveryDate || order.createdAt) === selectedDate);
  }, [orders, selectedDate]);

  const selectedAlerts = useMemo(() => {
    if (!selectedDate) return [];
    return alerts.filter((alert) => formatDateValue(alert.dueDate || alert.date || alert.createdAt) === selectedDate);
  }, [alerts, selectedDate]);

  const selectedPayments = useMemo(() => {
    if (!selectedDate) return [];
    return payments.filter((payment) => formatDateValue(payment.createdAt || payment.date || payment.transactionDate || payment.updatedAt) === selectedDate);
  }, [payments, selectedDate]);

  const selectedDeliveries = useMemo(() => {
    if (!selectedDate) return [];
    return orders.filter((order) => formatDateValue(order.deliveryDate) === selectedDate);
  }, [orders, selectedDate]);

  return (
    <div className="settings-container">
      <Sidebar onLogout={handleLogout} />

      <div className="main-content">
        <div className="page-header">
          <h1 className="page-title">Calendar</h1>
        </div>

        <div className="content-section" style={{ padding: '24px', background: '#fff', borderRadius: '16px' }}>
          <div style={{ marginBottom: '16px' }}>
            <h2 className="section-title" style={{ marginBottom: '6px' }}>Orders by date</h2>
            <p style={{ margin: 0, color: 'var(--gray-color)' }}>
              Click any date to view the related orders, alerts, payments, and deliveries.
            </p>
          </div>

          {loading ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--gray-color)' }}>Loading calendar...</div>
          ) : (
            <div style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden' }}>
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek,timeGridDay',
                }}
                height="auto"
                events={events}
                selectable={true}
                dateClick={(info) => openDateModal(info.dateStr)}
                eventClick={(info) => openDateModal(info.event.startStr)}
                dayMaxEvents={3}
              />
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div style={modalOverlayStyle} onClick={closeModal}>
          <div style={modalContentStyle} onClick={(event) => event.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '20px' }}>Details for {formatDisplayDate(selectedDate)}</h3>
                <p style={{ margin: '4px 0 0', color: 'var(--gray-color)' }}>Selected date overview</p>
              </div>
              <button onClick={closeModal} style={closeButtonStyle}>×</button>
            </div>

            <div style={{ display: 'grid', gap: '14px' }}>
              <SectionCard title="ORDER" items={selectedOrders} renderItem={(order) => (
                <div key={order._id || order.id} style={{ paddingBottom: '8px', borderBottom: '1px solid #f0f0f0' }}>
                  <div style={{ fontWeight: 600 }}>{order.orderId || order.orderName || 'Order'}</div>
                  <div style={{ color: 'var(--gray-color)', fontSize: '13px' }}>{order.customerId?.fullName || order.customerName || 'Customer'}</div>
                </div>
              )} />

              <SectionCard title="ALERT" items={selectedAlerts} renderItem={(alert) => (
                <div key={alert._id || alert.id} style={{ paddingBottom: '8px', borderBottom: '1px solid #f0f0f0' }}>
                  <div style={{ fontWeight: 600 }}>{alert.title || alert.name || 'Alert'}</div>
                  <div style={{ color: 'var(--gray-color)', fontSize: '13px' }}>{alert.message || alert.description || 'No details provided'}</div>
                </div>
              )} />

              <SectionCard title="PAYMENT" items={selectedPayments} renderItem={(payment) => (
                <div key={payment._id || payment.id} style={{ paddingBottom: '8px', borderBottom: '1px solid #f0f0f0' }}>
                  <div style={{ fontWeight: 600 }}>{payment.typeName || payment.name || 'Payment'}</div>
                  <div style={{ color: 'var(--gray-color)', fontSize: '13px' }}>{payment.amount ? `₹${payment.amount}` : 'Amount pending'}</div>
                </div>
              )} />

              <SectionCard title="TODAY DELIVERY" items={selectedDeliveries} renderItem={(order) => (
                <div key={order._id || order.id} style={{ paddingBottom: '8px', borderBottom: '1px solid #f0f0f0' }}>
                  <div style={{ fontWeight: 600 }}>{order.orderId || order.orderName || 'Delivery'}</div>
                  <div style={{ color: 'var(--gray-color)', fontSize: '13px' }}>{order.customerId?.fullName || order.customerName || 'Customer'}</div>
                </div>
              )} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SectionCard = ({ title, items, renderItem }) => (
  <div style={{ border: '1px solid #f0f0f0', borderRadius: '12px', padding: '12px 14px', background: '#fafafa' }}>
    <h4 style={{ margin: '0 0 10px', fontSize: '15px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{title}</h4>
    {items.length > 0 ? (
      <div style={{ display: 'grid', gap: '8px' }}>{items.map(renderItem)}</div>
    ) : (
      <p style={{ margin: 0, color: 'var(--gray-color)', fontSize: '13px' }}>No records found</p>
    )}
  </div>
);

const modalOverlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0, 0, 0, 0.4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: '20px',
};

const modalContentStyle = {
  width: '100%',
  maxWidth: '760px',
  maxHeight: '85vh',
  overflowY: 'auto',
  background: '#fff',
  borderRadius: '16px',
  padding: '20px',
  boxShadow: '0 16px 40px rgba(0, 0, 0, 0.2)',
};

const closeButtonStyle = {
  border: 'none',
  background: '#f5f5f5',
  width: '36px',
  height: '36px',
  borderRadius: '50%',
  cursor: 'pointer',
  fontSize: '18px',
};

export default CalendarPage;
