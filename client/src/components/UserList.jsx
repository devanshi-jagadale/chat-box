import { useState, useEffect } from 'react'
import { Search, User, MessageCircle } from 'lucide-react'
import { userService } from '../services/userService'
import toast from 'react-hot-toast'

const UserList = ({ users, setUsers, setIsLoading, onNewConversation }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredUsers, setFilteredUsers] = useState([])

  useEffect(() => {
    if (users.length === 0) {
      loadUsers()
    }
  }, [])

  useEffect(() => {
    // Filter users based on search query
    const filtered = users.filter(user =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredUsers(filtered)
  }, [users, searchQuery])

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      const data = await userService.getAllUsers()
      setUsers(data)
    } catch (error) {
      toast.error('Failed to load users')
      console.error('Error loading users:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartConversation = (user) => {
    const conversationData = {
      participantIds: [user.id],
      type: 'direct'
    }
    onNewConversation(conversationData)
  }

  const getStatusColor = (status) => {
    const statusColors = {
      online: 'bg-green-500',
      offline: 'bg-gray-400',
      away: 'bg-yellow-500'
    }
    return statusColors[status] || 'bg-gray-400'
  }

  const getLastSeenText = (lastSeen) => {
    if (!lastSeen) return 'Never'
    
    const now = new Date()
    const lastSeenDate = new Date(lastSeen)
    const diffInMinutes = Math.floor((now - lastSeenDate) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
          />
        </div>
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto">
        {filteredUsers.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {searchQuery ? 'No users found' : 'No users available'}
          </div>
        ) : (
          <div className="space-y-1">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center space-x-3 p-3 hover:bg-gray-50 transition-colors"
              >
                {/* Avatar */}
                <div className="relative">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-600" />
                    </div>
                  )}
                  
                  {/* Status Indicator */}
                  <div className={`absolute bottom-0 right-0 w-3 h-3 ${getStatusColor(user.status)} rounded-full border-2 border-white`} />
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {user.username}
                    </h4>
                    <span className="text-xs text-gray-500">
                      {getLastSeenText(user.lastSeen)}
                    </span>
                  </div>
                  
                  <p className="text-xs text-gray-500 truncate">
                    {user.email}
                  </p>
                  
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      user.status === 'online' 
                        ? 'bg-green-100 text-green-800'
                        : user.status === 'away'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.status}
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleStartConversation(user)}
                  className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  title="Start conversation"
                >
                  <MessageCircle className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default UserList 