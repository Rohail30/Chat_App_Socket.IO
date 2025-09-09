import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiRequest from '../../config/apiRequest.js';
import './Login.css';

function Login() {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const res = await apiRequest.get('/api/users/getAll');
        console.log('API Response ===>', res.data);
        const fetchedUsers = res.data.users || res.data || [];
        setUsers(fetchedUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
        setUsers([]); 
      }
    };

    fetchUserDetails();
  }, []);

  const handleLogin = (userId) => {
    navigate(`/chat/${userId}`);
  };

  const goHome = () => {
    navigate('/');
  };

  return (
    <div className="login-container">
      <h1 className="login-title">Choose Your Account</h1>
      <p className="login-subtitle">Select a user to log in:</p>

      <div className="user-list">
        {!users || users.length === 0 ? (
          <p className="empty-text">No items yet! Add one now.</p>
        ) : (
          users.map((user) => (
            <button
              key={user._id}
              className="user-button"
              onClick={() => handleLogin(user._id)}
            >
              {user.username}
            </button>
          ))
        )}
      </div>

      {/* Back to Home button */}
      <button className="back-button" onClick={goHome}>
        ⬅ Back to Home
      </button>
    </div>
  );
}

export default Login;
