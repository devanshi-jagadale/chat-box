import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './UserList.css'; 

const UserList = () => {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  // Get current logged-in user
  const currentUser = JSON.parse(localStorage.getItem('user'));

  // Redirect if not logged in
  useEffect(() => {
    if (!currentUser) {
      navigate('/');
    }
  }, []);

  // Fetch other users
  useEffect(() => {
    if (currentUser) {
      axios
        .get('http://localhost:5000/users', {
          params: { excludeId: currentUser.id },
        })
        .then((res) => setUsers(res.data))
        .catch((err) => console.error('User fetch error:', err));
    }
  }, [currentUser]);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>👤 Welcome, {currentUser?.email}</h2>
      <h3>📜 Available Users:</h3>
      <ul >
        {users.length === 0 ? (
          <p>No other users found</p>
        ) : (
          users.map((user) => (
            <li key={user.id} style={{ marginBottom: '1rem' }}>
              <Link to={`/chat/${user.id}`} style={{ fontSize: '18px' }}>
                {user.email}
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default UserList;
