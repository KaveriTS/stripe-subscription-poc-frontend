import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const location = useLocation();

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-brand">
          <Link to="/" className="brand-link">
            <h2>SubManager</h2>
            <span className="brand-subtitle">POC</span>
          </Link>
        </div>
        
        <nav className="header-nav">
          <Link 
            to="/" 
            className={`nav-link ${isActivePath('/') ? 'active' : ''}`}
          >
            Products
          </Link>
          <Link 
            to="/status" 
            className={`nav-link ${isActivePath('/status') ? 'active' : ''}`}
          >
            Status
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header; 