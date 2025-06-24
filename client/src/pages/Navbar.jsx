import { Link } from 'react-router-dom';
import './Navbar.css';
const Navbar = () => (
  <nav style={{ padding: '1rem', background: '#f2f2f2' }}>
    <Link to="/users" style={{ marginRight: '1rem' }}>Users</Link>
    <Link to="/chat">Chat</Link>
    <Link to="/" onClick={() => localStorage.clear()}>Logout</Link>
  </nav>
);

export default Navbar;
