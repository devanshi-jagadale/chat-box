import { useState, useEffect } from 'react'
import { X, Search, Users, User } from 'lucide-react'
import { userService } from '../services/userService'
import toast from 'react-hot-toast'

const NewConversationModal = ({ onClose, onSubmit, setUsers }) => {
  const [conversationType, setConversationType] = useState('direct')
  const [conversationName, setConversationName] = useState('')
  const [selectedUsers, setSelectedUsers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [availableUsers, setAvailableUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    // Filter users based on search query
    const filtered = availableUsers.filter(user =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredUsers(filtered)
  }, [availableUsers, searchQuery])

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      const data = await userService.getAllUsers()
      setAvailableUsers(data)
      setUsers(data)
    } catch (error) {
      toast.error('Failed to load users')
      console.error('Error loading users:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUserToggle = (user) => {
    if (conversationType === 'direct') {
      // For direct conversations, only allow one user
      setSelectedUsers([user])
    } else {
      // For group conversations, allow multiple users
      setSelectedUsers(prev => {
        const isSelected = prev.some(u => u.id === user.id)
        if (isSelected) {
          return prev.filter(u => u.id !== user.id)
        } else {
          return [...prev, user]
        }
      })
    }
  }

  const handleSubmit = () => {
    if (conversationType === 'direct' && selectedUsers.length !== 1) {
      toast.error('Please select exactly one user for direct conversation')
      return
    }

    if (conversationType === 'group' && selectedUsers.length === 0) {
      toast.error('Please select at least one user for group conversation')
      return
    }

    if (conversationType === 'group' && !conversationName.trim()) {
      toast.error('Please enter a group name')
      return
    }

    const conversationData = {
      participantIds: selectedUsers.map(user => user.id),
      type: conversationType,
      name: conversationType === 'group' ? conversationName.trim() : undefined
    }

    onSubmit(conversationData)
  }

  const isUserSelected = (user) => {
    return selectedUsers.some(u => u.id === user.id)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">New Conversation</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Conversation Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Conversation Type
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="direct"
                  checked={conversationType === 'direct'}
                  onChange={(e) => setConversationType(e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Direct Message</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="group"
                  checked={conversationType === 'group'}
                  onChange={(e) => setConversationType(e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Group Chat</span>
              </label>
            </div>
          </div>

          {/* Group Name */}
          {conversationType === 'group' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Group Name
              </label>
              <input
                type="text"
                value={conversationName}
                onChange={(e) => setConversationName(e.target.value)}
                placeholder="Enter group name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          )}

          {/* User Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select {conversationType === 'direct' ? 'User' : 'Users'}
            </label>
            
            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
              />
            </div>

            {/* Users List */}
            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
              {isLoading ? (
                <div className="p-4 text-center text-gray-500">Loading users...</div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-4 text-center text-gray-500">No users found</div>
              ) : (
                <div className="space-y-1">
                  {filteredUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleUserToggle(user)}
                      className={`w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 transition-colors ${
                        isUserSelected(user) ? 'bg-primary-50 border-r-2 border-primary-600' : ''
                      }`}
                    >
                      {/* Avatar */}
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.username}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-gray-600" />
                        </div>
                      )}

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user.username}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>

                      {/* Selection Indicator */}
                      {isUserSelected(user) && (
                        <div className="w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Selected Users Summary */}
          {selectedUsers.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selected {conversationType === 'direct' ? 'User' : 'Users'} ({selectedUsers.length})
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center space-x-2 bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm"
                  >
                    <span>{user.username}</span>
                    <button
                      onClick={() => handleUserToggle(user)}
                      className="text-primary-600 hover:text-primary-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={selectedUsers.length === 0 || (conversationType === 'group' && !conversationName.trim())}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            Create Conversation
          </button>
        </div>
      </div>
    </div>
  )
}

export default NewConversationModal 