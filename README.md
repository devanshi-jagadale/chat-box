# ChatApp - Real-time Messaging Application

A modern, real-time messaging application built with Node.js, Express.js, PostgreSQL, Prisma, React.js, and Socket.IO.

## Features

- **Real-time Messaging**: Instant message delivery using Socket.IO
- **User Authentication**: Secure JWT-based authentication with bcrypt password hashing
- **Direct & Group Chats**: Support for both one-on-one and group conversations
- **User Status**: Online/offline status indicators
- **Typing Indicators**: Real-time typing notifications
- **Message Management**: Edit and delete messages (within time limits)
- **Responsive Design**: Modern UI built with Tailwind CSS
- **Real-time Updates**: Live conversation updates and notifications

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Database (Supabase cloud)
- **Prisma** - ORM for database operations
- **Socket.IO** - Real-time communication
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Express Validator** - Input validation

### Frontend
- **React.js** - UI library
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client
- **Socket.IO Client** - Real-time client
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **React Hook Form** - Form handling
- **React Hot Toast** - Toast notifications

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database (or Supabase account)
- npm or yarn package manager

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd chatapp
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment template
   cd ../server
   cp env.example .env
   ```

4. **Configure Environment Variables**
   Edit `server/.env` with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   DATABASE_URL="postgresql://username:password@host:port/database?schema=public"
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=7d
   CLIENT_URL=http://localhost:5173
   ```

5. **Database Setup**
   ```bash
   # Generate Prisma client
   npm run prisma:generate
   
   # Push schema to database
   npm run prisma:push
   
   # (Optional) Open Prisma Studio
   npm run prisma:studio
   ```

## Running the Application

### Development Mode
```bash
# From the root directory
npm run dev
```

This will start both the server (port 5000) and client (port 5173) concurrently.

### Production Mode
```bash
# Build the client
npm run build

# Start the server
npm start
```

### Individual Services
```bash
# Server only
npm run server:dev

# Client only
npm run client:dev
```

## Project Structure

```
chatapp/
├── server/                 # Backend server
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── routes/            # API routes
│   ├── prisma/            # Database schema and migrations
│   ├── index.js           # Main server file
│   └── package.json
├── client/                 # Frontend React app
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── App.jsx        # Main app component
│   │   └── main.jsx       # Entry point
│   ├── public/            # Static assets
│   └── package.json
└── package.json            # Root package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/password` - Change password
- `GET /api/users/search/:query` - Search users

### Conversations
- `GET /api/conversations` - Get user conversations
- `GET /api/conversations/:id` - Get conversation by ID
- `POST /api/conversations` - Create new conversation
- `POST /api/conversations/:id/participants` - Add participants
- `DELETE /api/conversations/:id/participants/:userId` - Remove participant
- `DELETE /api/conversations/:id/leave` - Leave conversation

### Messages
- `GET /api/messages/conversation/:conversationId` - Get conversation messages
- `POST /api/messages` - Send message
- `PUT /api/messages/:id` - Update message
- `DELETE /api/messages/:id` - Delete message
- `PUT /api/messages/read/:conversationId` - Mark messages as read
- `GET /api/messages/unread/count` - Get unread count

## Socket.IO Events

### Client to Server
- `authenticate` - Authenticate socket connection
- `joinConversation` - Join a conversation room
- `leaveConversation` - Leave a conversation room
- `sendMessage` - Send a message
- `typing` - Start typing indicator
- `stopTyping` - Stop typing indicator

### Server to Client
- `newMessage` - New message received
- `userTyping` - User started typing
- `userStopTyping` - User stopped typing
- `userStatusChanged` - User status changed
- `authError` - Authentication error

## Database Schema

The application uses the following main entities:

- **User**: User accounts with authentication
- **Conversation**: Chat conversations (direct or group)
- **ConversationParticipant**: Many-to-many relationship between users and conversations
- **Message**: Individual chat messages

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.

## Future Enhancements

- File and image sharing
- Voice and video calls
- Message reactions
- Message search
- User blocking
- Push notifications
- Message encryption
- Group chat management
- User avatars and profiles
- Message threading 