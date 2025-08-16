import { Users, User } from 'lucide-react'

const ChatHeader = ({ conversation }) => {
  const getDisplayName = () => {
    if (conversation.type === 'group') {
      return conversation.name || 'Group Chat'
    }
    return conversation.participants[0]?.username || 'Unknown User'
  }

  const getAvatar = () => {
    if (conversation.type === 'group') {
      return (
        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
          <Users className="h-4 w-4 text-primary-600" />
        </div>
      )
    }
    
    const participant = conversation.participants[0]
    if (participant?.avatar) {
      return (
        <img
          src={participant.avatar}
          alt={participant.username}
          className="w-8 h-8 rounded-full object-cover"
        />
      )
    }
    
    return (
      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
        <User className="h-4 w-4 text-gray-600" />
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
      <div className={`w-2 h-2 ${statusColors[participant.status] || 'bg-gray-400'} rounded-full`} />
    )
  }

  const getParticipantCount = () => {
    if (conversation.type === 'group') {
      return `${conversation.participants.length + 1} members`
    }
    return null
  }

  return (
    <div className="flex items-center space-x-3 p-4 border-b border-gray-200 bg-white">
      {/* Avatar */}
      <div className="relative">
        {getAvatar()}
        {getStatusIndicator()}
      </div>

      {/* Conversation Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-medium text-gray-900 truncate">
          {getDisplayName()}
        </h3>
        {getParticipantCount() && (
          <p className="text-sm text-gray-500">
            {getParticipantCount()}
          </p>
        )}
      </div>

      {/* Additional Actions */}
      <div className="flex items-center space-x-2">
        {/* You can add more action buttons here like:
        - Video call
        - Voice call
        - More options
        */}
      </div>
    </div>
  )
}

export default ChatHeader 