import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './Chat.css'; 

function Chat() {
  const { receiverId } = useParams();
  const current = JSON.parse(localStorage.getItem('user'));
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  const fetchMessages = async () => {
    const res = await axios.get('http://localhost:5000/messages', {
      params: { user1: current.id, user2: receiverId }
    });
    setMessages(res.data);
  };

  const sendMessage = async () => {
    if (!text.trim()) return;
    await axios.post('http://localhost:5000/message', {
      senderId: current.id,
      receiverId: Number(receiverId),
      content: text
    });
    setText('');
    fetchMessages();
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Chat with User {receiverId}</h2>
      <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ccc', padding: '1rem' }}>
        {messages.map((m) => (
          <p key={m.id} style={{ textAlign: m.senderId === current.id ? 'right' : 'left' }}>
            {m.content}
          </p>
        ))}
      </div>
      <div style={{ marginTop: '1rem' }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type message"
          style={{ width: '80%', padding: '0.5rem' }}
        />
        <button onClick={sendMessage} style={{ padding: '0.5rem 1rem' }}>Send</button>
      </div>
    </div>
  );
}

export default Chat;
