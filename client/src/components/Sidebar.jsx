import { useState, useEffect } from 'react'
import { Plus, Search, MoreVertical } from 'lucide-react'
import { conversationService } from '../services/conversationService'
import ConversationItem from './ConversationItem'
import NewConversationModal from './NewConversationModal'
import toast from 'react-hot-toast'

const Sidebar = ({
  conversations,
  selectedConversation,
  onConversationSelect,
  onConversationUpdate,
  onConversationRemove,
  onNewConversation,
  setConversations,
  setUsers,
  setIsLoading
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewConversationModal, setShowNewConversationModal] = useState(false)
  const [filteredConversations, setFilteredConversations] = useState([])

  useEffect(() => {
    loadConversations()
  }, [])

  useEffect(() => {
    // Filter conversations based on search query
    const filtered = conversations.filter(conv => {
      if (conv.type === 'direct' && conv.participants.length > 0) {
        return conv.participants[0].username.toLowerCase().includes(searchQuery.toLowerCase())
      } else if (conv.type === 'group' && conv.name) {
        return conv.name.toLowerCase().includes(searchQuery.toLowerCase())
      }
      return false
    })
    setFilteredConversations(filtered)
  }, [conversations, searchQuery])

  const loadConversations = async () => {
    try {
      setIsLoading(true)
      const data = await conversationService.getAllConversations()
      setConversations(data)
    } catch (error) {
      toast.error('Failed to load conversations')
      console.error('Error loading conversations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewConversation = async (conversationData) => {
    try {
      const newConversation = await conversationService.createConversation(conversationData)
      onNewConversation(newConversation)
      setShowNewConversationModal(false)
      toast.success('Conversation created successfully')
    } catch (error) {
      toast.error(error.message || 'Failed to create conversation')
    }
  }

  const handleConversationUpdate = (updatedConversation) => {
    onConversationUpdate(updatedConversation)
  }

  const handleConversationRemove = async (conversationId) => {
    try {
      await conversationService.leaveConversation(conversationId)
      onConversationRemove(conversationId)
      toast.success('Left conversation successfully')
    } catch (error) {
      toast.error('Failed to leave conversation')
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search and New Conversation */}
      <div className="p-4 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
          />
        </div>

        {/* New Conversation Button */}
        <button
          onClick={() => setShowNewConversationModal(true)}
          className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          <span>New Conversation</span>
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {searchQuery ? 'No conversations found' : 'No conversations yet'}
          </div>
        ) : (
          <div className="space-y-1">
            {filteredConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isSelected={selectedConversation?.id === conversation.id}
                onSelect={() => onConversationSelect(conversation)}
                onUpdate={handleConversationUpdate}
                onRemove={handleConversationRemove}
              />
            ))}
          </div>
        )}
      </div>

      {/* New Conversation Modal */}
      {showNewConversationModal && (
        <NewConversationModal
          onClose={() => setShowNewConversationModal(false)}
          onSubmit={handleNewConversation}
          setUsers={setUsers}
        />
      )}
    </div>
  )
}

export default Sidebar 