import { useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Execute logout
    logout();
    
    // Redirect to login page
    navigate('/login', { replace: true });
  }, [logout, navigate]);
  
  return null;
};

export default Logout;
