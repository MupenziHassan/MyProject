import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { logout } from '../../services/authService';
import '../../styles/Header.css';

const Header = ({ pageTitle }) => {
  const { auth, setAuth } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    setAuth({
      isAuthenticated: false,
      user: null,
      role: null
    });
    navigate('/login');
  };
  
  return (
    <header className="app-header">
      <h1 className="page-title">{pageTitle}</h1>
      
      <div className="header-actions">
        <div className="user-info">
          <span className="welcome-text">Welcome,</span>
          <span className="user-name">{auth && auth.user ? auth.user.name : 'User'}</span>
        </div>
        
        <button className="logout-btn" onClick={handleLogout}>
          <i className="fas fa-sign-out-alt"></i>
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
