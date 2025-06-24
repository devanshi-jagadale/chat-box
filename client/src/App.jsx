import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import UserList from './pages/UserList';
import Chat from './pages/Chat';
import Navbar from './pages/Navbar';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/users" element={<UserList />} />
        <Route path="/chat/:receiverId" element={<Chat />} />
      </Routes>
    </Router>
  );
}

export default App;
