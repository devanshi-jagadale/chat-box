import { useState } from 'react'
import { MoreVertical, Users, User } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const ConversationItem = ({
  conversation,
  isSelected,
  onSelect,
  onUpdate,
  onRemove
}) => {
  const [showMenu, setShowMenu] = useState(false)

  const handleClick = () => {
    onSelect()
  }

  const handleMenuToggle = (e) => {
    e.stopPropagation()
    setShowMenu(!showMenu)
  }

  const handleRemove = (e) => {
    e.stopPropagation()
    onRemove(conversation.id)
    setShowMenu(false)
  }

  const getDisplayName = () => {
    if (conversation.type === 'group') {
      return conversation.name || 'Group Chat'
    }
    return conversation.participants[0]?.username || 'Unknown User'
  }

  const getLastMessage = () => {
    if (!conversation.lastMessage) return 'No messages yet'
    
    const sender = conversation.lastMessage.sender.username
    const content = conversation.lastMessage.content
    
    if (conversation.type === 'group') {
      return `${sender}: ${content}`
    }
    return content
  }

  const getAvatar = () => {
    if (conversation.type === 'group') {
      return (
        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
          <Users className="h-5 w-5 text-primary-600" />
        </div>
      )
    }
    
    const participant = conversation.participants[0]
    if (participant?.avatar) {
      return (
        <img
          src={participant.avatar}
          alt={participant.username}
          className="w-10 h-10 rounded-full object-cover"
        />
      )
    }
    
    return (
      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
        <User className="h-5 w-5 text-gray-600" />
      </div>
    )
  }

  const getStatusIndicator = () => {
    if (conversation.type === 'group') return null
    
    const participant = conversation.participants[0]
    if (!participant) return null
    
    const statusColors = {
      online: 'bg-green-500',
      offline: 'bg-gray-400',
      away: 'bg-yellow-500'
    }
    
    return (
      <div className={`absolute bottom-0 right-0 w-3 h-3 ${statusColors[participant.status] || 'bg-gray-400'} rounded-full border-2 border-white`} />
    )
  }

  return (
    <div
      className={`relative group cursor-pointer transition-colors ${
        isSelected
          ? 'bg-primary-50 border-r-2 border-primary-600'
          : 'hover:bg-gray-50'
      }`}
      onClick={handleClick}
    >
      <div className="flex items-center space-x-3 p-3">
        {/* Avatar */}
        <div className="relative">
          {getAvatar()}
          {getStatusIndicator()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900 truncate">
              {getDisplayName()}
            </h4>
            {conversation.updatedAt && (
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(conversation.updatedAt), { addSuffix: true })}
              </span>
            )}
          </div>
          
          <p className="text-sm text-gray-500 truncate">
            {getLastMessage()}
          </p>
        </div>

        {/* Menu */}
        <div className="relative">
          <button
            onClick={handleMenuToggle}
            className="p-1 text-gray-400 hover:text-gray-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-md shadow-lg border border-gray-200 z-10">
              <button
                onClick={handleRemove}
                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
              >
                Leave Conversation
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ConversationItem 