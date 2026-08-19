import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import '../public.css';

const PublicLayout = ({ children }) => (
  <div className="public-site">
    <header className="public-header">
      <Link className="public-brand" to="/">Naari Art</Link>
      <nav className="public-nav" aria-label="Main navigation">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/about">About</NavLink>
        <NavLink to="/product">Product</NavLink>
        <NavLink to="/contact">Contact</NavLink>
      </nav>
      <Link className="public-login" to="/login">Staff login</Link>
    </header>
    <main>{children}</main>
    <footer className="public-footer">Naari Art <span>Made with <small style={{ color: '#bf684d' }}>Codezil Technologies</small> in Surat</span></footer>
  </div>
);

export default PublicLayout;
