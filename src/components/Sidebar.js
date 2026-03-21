import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles.css';
import { FiFileText, FiLayout, FiLogOut, FiMenu, FiSettings, FiShoppingBag, FiUser, FiUsers, FiX } from 'react-icons/fi';

const Sidebar = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    // Close mobile menu after navigation
    setIsMobileMenuOpen(false);
    // Add other navigation logic as needed
  };

  const handleLogout = (e) => {
    e.preventDefault();
    onLogout();
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Mobile Menu Toggle */}
      <button 
        className="mobile-menu-toggle"
        onClick={toggleMobileMenu}
        aria-label="Toggle mobile menu"
      >
        {isMobileMenuOpen ? <FiX /> : <FiMenu />}
      </button>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-menu-overlay" 
          onClick={toggleMobileMenu}
        >
          <div className="mobile-menu-content" onClick={(e) => e.stopPropagation()}>
            {/* Mobile Logo */}
            <div className="mobile-logo">
              <img src={require('../assets/naari-logo.png')} className='logo' alt="Naari Art" />
            </div>
            
            {/* Mobile Navigation */}
            <nav className="mobile-nav">
              {navItems.map(item => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={`mobile-nav-item ${activeItem === item.id ? 'active' : ''}`}
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
            
            {/* Mobile Logout */}
            <div className="mobile-logout">
              <a className="logout-btn" href='#logout' onClick={handleLogout}>
                <span className="nav-icon"><FiLogOut /></span>
                <span>Log Out</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
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
          <a className="logout-btn" href='#logout' onClick={handleLogout}>
            <span className="nav-icon"><FiLogOut /></span>
            <span>Log Out</span>
          </a>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
