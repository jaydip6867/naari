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
  // const [payments, setPayments] = useState([]);
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
        // accountingAPI.getAccountingList(),
      ]);
      // console.log('alert:', alertsData);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setAlerts(Array.isArray(alertsData) ? alertsData : []);
      // setPayments(Array.isArray(accountingData) ? accountingData : []);
    } catch (error) {
      console.error('Error loading calendar data:', error);
    } finally {
      setLoading(false);
      // console.log(orders, alerts, payments);
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
    const eventList = [];

    const orderLabel = (order) => order.orderId || order.orderName || 'Order';
    orders.forEach((order) => {
      const createdDate = formatDateValue(order.createdAt);
      if (createdDate) {
        eventList.push({
          id: `${order._id || order.id}-created`,
          title: `${orderLabel(order)} created`,
          start: createdDate,
          allDay: true,
          backgroundColor: '#6C5CE7',
          borderColor: '#6C5CE7',
          extendedProps: {
            type: 'orderCreated',
            customerName: order.customerId?.fullName || order.customerName || 'Customer',
            orderId: order.orderId || order._id,
          },
        });
      }

      const deliveryDate = formatDateValue(order.deliveryDate);
      if (deliveryDate) {
        eventList.push({
          id: `${order._id || order.id}-delivery`,
          title: `${orderLabel(order)} delivery`,
          start: deliveryDate,
          allDay: true,
          backgroundColor: '#00B894',
          borderColor: '#00B894',
          extendedProps: {
            type: 'delivery',
            customerName: order.customerId?.fullName || order.customerName || 'Customer',
            orderId: order.orderId || order._id,
          },
        });
      }
    });

    alerts.forEach((alert) => {
      const alertDate = formatDateValue(alert.dueDate || alert.date || alert.createdAt);
      if (alertDate) {
        eventList.push({
          id: alert._id || alert.id,
          title: alert.title || alert.name || 'Alert',
          start: alertDate,
          allDay: true,
          backgroundColor: '#FDcb6E',
          borderColor: '#FDcb6E',
          extendedProps: {
            type: 'alert',
          },
        });
      }
    });

    return eventList;
  }, [orders, alerts]);

  const calendarCounts = useMemo(() => {
    const counts = {};
    const addCount = (date, key) => {
      if (!date) return;
      if (!counts[date]) counts[date] = { orders: 0, deliveries: 0, alerts: 0 };
      counts[date][key] += 1;
    };

    orders.forEach((order) => {
      addCount(formatDateValue(order.createdAt), 'orders');
      addCount(formatDateValue(order.deliveryDate), 'deliveries');
    });

    alerts.forEach((alert) => {
      addCount(formatDateValue(alert.dueDate || alert.date || alert.createdAt), 'alerts');
    });

    return counts;
  }, [orders, alerts]);

  const openDateModal = (dateValue) => {
    setSelectedDate(formatDateValue(dateValue));
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDate('');
  };

  const selectedCreatedOrders = useMemo(() => {
    if (!selectedDate) return [];
    return orders.filter((order) => formatDateValue(order.createdAt) === selectedDate);
  }, [orders, selectedDate]);

  const selectedAlerts = useMemo(() => {
    if (!selectedDate) return [];
    return alerts.filter((alert) => formatDateValue(alert.dueDate || alert.date || alert.createdAt) === selectedDate);
  }, [alerts, selectedDate]);

  // const selectedPayments = useMemo(() => {
  //   if (!selectedDate) return [];
  //   return payments.filter((payment) => formatDateValue(payment.createdAt || payment.date || payment.transactionDate || payment.updatedAt) === selectedDate);
  // }, [payments, selectedDate]);

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
                {/* <p style={{ margin: '4px 0 0', color: 'var(--gray-color)' }}>Selected date overview</p> */}
              </div>
              <button onClick={closeModal} style={closeButtonStyle}>×</button>
            </div>

            <div style={{ display: 'grid', gap: '14px' }}>
              <SectionCard title="ORDERS CREATED" items={selectedCreatedOrders} renderItem={(order) => (
                <div key={order._id || order.id} style={{ paddingBottom: '8px', borderBottom: '1px solid #f0f0f0' }}>
                  <div style={{ fontWeight: 600 }}>{order.orderId || order.orderName || 'Order'}</div>
                  <div styl
                  e={{ color: 'var(--gray-color)', fontSize: '13px' }}>{order.customerId?.fullName || order.customerName || 'Customer'}</div>
                </div>
              )} />

              <SectionCard title="ALERT" items={selectedAlerts} renderItem={(alert) => (
                <div key={alert._id || alert.id} style={{ paddingBottom: '8px', borderBottom: '1px solid #f0f0f0' }}>
                  <div style={{ fontWeight: 600 }}>{alert?.amount} - { alert.name || 'Alert'}</div>
                  <div style={{ color: 'var(--gray-color)', fontSize: '13px' }}>{alert.description || 'No details provided'}</div>
                </div>
              )} />

              {/* <SectionCard title="PAYMENT" items={selectedPayments} renderItem={(payment) => (
                <div key={payment._id || payment.id} style={{ paddingBottom: '8px', borderBottom: '1px solid #f0f0f0' }}>
                  <div style={{ fontWeight: 600 }}>{payment.typeName || payment.name || 'Payment'}</div>
                  <div style={{ color: 'var(--gray-color)', fontSize: '13px' }}>{payment.amount ? `₹${payment.amount}` : 'Amount pending'}</div>
                </div>
              )} /> */}

              <SectionCard title="TODAY DELIVERY" items={selectedDeliveries} renderItem={(order) => (
                <div key={order._id || order.id} style={{ paddingBottom: '8px', borderBottom: '1px solid #f0f0f0' }}>
                  <div style={{ fontWeight: 600 }}>{order.orderId || order.orderName || 'Delivery'}</div>
                  <div style={{ color: 'var(--gray-color)', fontSize: '13px' }}>{order.customerId?.fullName || 'Customer'}</div>
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
    <h4 style={{ margin: '0 0 10px', fontSize: '15px', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--primary-color)' }}>{title}</h4>
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
