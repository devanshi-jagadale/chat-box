import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { MoreVertical, Edit, Trash2 } from 'lucide-react'
import { messageService } from '../services/messageService'
import toast from 'react-hot-toast'

const MessageItem = ({ message, isOwnMessage }) => {
  const [showMenu, setShowMenu] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(message.content)

  const handleEdit = () => {
    setIsEditing(true)
    setEditContent(message.content)
    setShowMenu(false)
  }

  const handleSave = async () => {
    if (editContent.trim() === message.content) {
      setIsEditing(false)
      return
    }

    try {
      await messageService.updateMessage(message.id, editContent.trim())
      message.content = editContent.trim()
      setIsEditing(false)
      toast.success('Message updated successfully')
    } catch (error) {
      toast.error(error.message || 'Failed to update message')
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditContent(message.content)
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return
    }

    try {
      await messageService.deleteMessage(message.id)
      toast.success('Message deleted successfully')
      // Note: In a real app, you'd want to remove this message from the parent state
    } catch (error) {
      toast.error(error.message || 'Failed to delete message')
    }
    setShowMenu(false)
  }

  const canEdit = () => {
    const messageAge = Date.now() - new Date(message.createdAt).getTime()
    const maxEditAge = 5 * 60 * 1000 // 5 minutes
    return messageAge <= maxEditAge
  }

  const canDelete = () => {
    const messageAge = Date.now() - new Date(message.createdAt).getTime()
    const maxDeleteAge = 5 * 60 * 1000 // 5 minutes
    return messageAge <= maxDeleteAge
  }

  if (isEditing) {
    return (
      <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
        <div className="max-w-xs lg:max-w-md">
          <div className="bg-white border border-gray-300 rounded-lg p-3 shadow-sm">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full resize-none border-none focus:ring-0 focus:outline-none text-sm"
              rows={2}
              autoFocus
            />
            <div className="flex items-center justify-end space-x-2 mt-2">
              <button
                onClick={handleCancel}
                className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="text-xs bg-primary-600 text-white px-2 py-1 rounded hover:bg-primary-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md group relative ${isOwnMessage ? 'order-2' : 'order-1'}`}>
        {/* Avatar for other users */}
        {!isOwnMessage && (
          <div className="flex items-end space-x-2 mb-1">
            {message.sender.avatar ? (
              <img
                src={message.sender.avatar}
                alt={message.sender.username}
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-xs text-gray-600 font-medium">
                  {message.sender.username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <span className="text-xs text-gray-500">{message.sender.username}</span>
          </div>
        )}

        {/* Message Content */}
        <div
          className={`rounded-lg px-3 py-2 shadow-sm ${
            isOwnMessage
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-900'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        </div>

        {/* Message Info */}
        <div className={`flex items-center space-x-2 mt-1 text-xs text-gray-500 ${
          isOwnMessage ? 'justify-end' : 'justify-start'
        }`}>
          <span>{formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}</span>
          {message.isRead && isOwnMessage && (
            <span className="text-primary-500">✓✓</span>
          )}
        </div>

        {/* Message Actions Menu */}
        {isOwnMessage && (
          <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                {canEdit() && (
                  <button
                    onClick={handleEdit}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md flex items-center space-x-2"
                  >
                    <Edit className="h-3 w-3" />
                    <span>Edit</span>
                  </button>
                )}
                {canDelete() && (
                  <button
                    onClick={handleDelete}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md flex items-center space-x-2"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default MessageItem 