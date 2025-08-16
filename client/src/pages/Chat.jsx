import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useSocket } from '../contexts/SocketContext'
import Sidebar from '../components/Sidebar'
import ChatInterface from '../components/ChatInterface'
import UserList from '../components/UserList'
import { LogOut, Users, MessageCircle } from 'lucide-react'

const Chat = () => {
  const { user, logout } = useAuth()
  const [activeView, setActiveView] = useState('conversations') // conversations, users
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [conversations, setConversations] = useState([])
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const handleLogout = () => {
    logout()
  }

  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation)
    setActiveView('conversations')
  }

  const handleNewConversation = (conversation) => {
    setConversations(prev => [conversation, ...prev])
    setSelectedConversation(conversation)
    setActiveView('conversations')
  }

  const handleConversationUpdate = (updatedConversation) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === updatedConversation.id ? updatedConversation : conv
      )
    )
    
    if (selectedConversation?.id === updatedConversation.id) {
      setSelectedConversation(updatedConversation)
    }
  }

  const handleConversationRemove = (conversationId) => {
    setConversations(prev => prev.filter(conv => conv.id !== conversationId))
    
    if (selectedConversation?.id === conversationId) {
      setSelectedConversation(null)
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">ChatApp</h1>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
          
          {/* User Info */}
          <div className="mt-4 flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-gray-900">{user?.username}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveView('conversations')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeView === 'conversations'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <MessageCircle className="h-4 w-4" />
              <span>Conversations</span>
            </div>
          </button>
          <button
            onClick={() => setActiveView('users')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeView === 'users'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Users</span>
            </div>
          </button>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-hidden">
          {activeView === 'conversations' ? (
            <Sidebar
              conversations={conversations}
              selectedConversation={selectedConversation}
              onConversationSelect={handleConversationSelect}
              onConversationUpdate={handleConversationUpdate}
              onConversationRemove={handleConversationRemove}
              onNewConversation={handleNewConversation}
              setConversations={setConversations}
              setUsers={setUsers}
              setIsLoading={setIsLoading}
            />
          ) : (
            <UserList
              users={users}
              setUsers={setUsers}
              setIsLoading={setIsLoading}
              onNewConversation={handleNewConversation}
            />
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <ChatInterface
            conversation={selectedConversation}
            onConversationUpdate={handleConversationUpdate}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Select a conversation
              </h3>
              <p className="text-gray-500">
                Choose a conversation from the sidebar to start chatting
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Chat 