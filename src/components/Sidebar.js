import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles.css';
import { FiFileText, FiLayout, FiLogOut, FiSettings, FiShoppingBag, FiUser, FiUsers } from 'react-icons/fi';

const Sidebar = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <FiLayout /> },
    { id: 'customers', label: 'Customers', icon: <FiUser /> },
    { id: 'orders', label: 'Orders', icon: <FiShoppingBag /> },
    { id: 'team', label: 'Team', icon: <FiUsers /> },
    { id: 'tasks', label: 'Tasks', icon: <FiFileText /> },
    { id: 'settings', label: 'Settings', icon: <FiSettings /> }
  ];

  // Get current active item based on route
  const getActiveItem = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'dashboard';
    if (path === '/settings') return 'settings';
    return 'dashboard'; // default
  };

  const activeItem = getActiveItem();

  const handleNavClick = (itemId) => {
    if (itemId === 'dashboard') {
      navigate('/dashboard');
    } else if (itemId === 'settings') {
      navigate('/settings');
    }
    // Add other navigation logic as needed
  };

  const handleLogout = (e) => {
    e.preventDefault();
    onLogout();
  };

  return (
    <div className="sidebar">
      <div className="logo">
        <img src={require('../assets/naari-logo.png')} className='logo' alt="Naari Art" />
      </div>
      
      <nav className="nav-menu">
        {navItems.map(item => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={`nav-item ${activeItem === item.id ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              handleNavClick(item.id);
            }}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </a>
        ))}
      </nav>

      <div className="logout">
        <a href="#logout" className="logout-btn" onClick={handleLogout}>
          <span className="nav-icon"><FiLogOut /></span>
          <span>Log Out</span>
        </a>
      </div>
    </div>
  );
};

export default Sidebar;
