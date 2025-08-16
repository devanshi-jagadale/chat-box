import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useSocket } from '../contexts/SocketContext'
import { messageService } from '../services/messageService'
import MessageList from './MessageList'
import MessageInput from './MessageInput'
import ChatHeader from './ChatHeader'
import toast from 'react-hot-toast'
console.log("ChatInterface mounted");

const ChatInterface = ({ conversation, onConversationUpdate }) => {
  const { user } = useAuth()
  const { 
    joinConversation, 
    leaveConversation, 
    sendMessage: socketSendMessage,
    onNewMessage,
    onUserTyping,
    onUserStopTyping,
    removeListener,
    startTyping,
    stopTyping
  } = useSocket()
  
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [typingUsers, setTypingUsers] = useState([])
  const [isTyping, setIsTyping] = useState(false)
  const typingTimeoutRef = useRef(null)

  // Handlers wrapped in useCallback to keep reference stable
  const handleNewMessage = useCallback((message) => {
    if (message.conversationId === conversation.id) {
      setMessages(prev => [...prev, message])
      onConversationUpdate({
        ...conversation,
        lastMessage: message,
        updatedAt: message.createdAt
      })
    }
  }, [conversation, onConversationUpdate])

  const handleUserTyping = useCallback((data) => {
    if (data.conversationId === conversation.id && data.userId !== user.id) {
      setTypingUsers(prev => {
        const existing = prev.find(u => u.userId === data.userId)
        if (!existing) {
          return [...prev, { userId: data.userId, username: data.username }]
        }
        return prev
      })
    }
  }, [conversation, user])

  const handleUserStopTyping = useCallback((data) => {
    if (data.conversationId === conversation.id) {
      setTypingUsers(prev => prev.filter(u => u.userId !== data.userId))
    }
  }, [conversation])

  useEffect(() => {
    if (conversation) {
      loadMessages()
      joinConversation(conversation.id)

      onNewMessage(handleNewMessage)
      onUserTyping(handleUserTyping)
      onUserStopTyping(handleUserStopTyping)

      return () => {
        leaveConversation(conversation.id)
        removeListener("newMessage", handleNewMessage)
        removeListener("userTyping", handleUserTyping)
        removeListener("userStopTyping", handleUserStopTyping)
      }
    }
    // eslint-disable-next-line
  }, [
    conversation?.id,
    handleNewMessage,
    handleUserTyping,
    handleUserStopTyping
  ])

  const loadMessages = async () => {
    try {
      setIsLoading(true)
      const data = await messageService.getMessages(conversation.id)
      setMessages(data.messages || [])
    } catch (error) {
      toast.error('Failed to load messages')
      console.error('Error loading messages:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = (content) => {
  if (!content.trim()) return;

  try {
    socketSendMessage({
      conversationId: conversation.id,
      content: content.trim(),
      type: 'text',
    });

  } catch (error) {
    toast.error('Failed to send message');
    console.error('Error sending message:', error);
  }
};


  const handleTyping = (isTypingNow) => {
    if (isTypingNow && !isTyping) {
      startTyping({ conversationId: conversation.id })
      setIsTyping(true)
    } else if (!isTypingNow && isTyping) {
      stopTyping({ conversationId: conversation.id })
      setIsTyping(false)
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        stopTyping({ conversationId: conversation.id })
        setIsTyping(false)
      }
    }, 3000)
  }

  const getTypingText = () => {
    if (typingUsers.length === 0) return null
    
    if (typingUsers.length === 1) {
      return `${typingUsers[0].username} is typing...`
    }
    
    if (typingUsers.length === 2) {
      return `${typingUsers[0].username} and ${typingUsers[1].username} are typing...`
    }
    
    return 'Several people are typing...'
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Chat Header */}
      <ChatHeader conversation={conversation} />

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <MessageList
          messages={messages}
          isLoading={isLoading}
          currentUserId={user?.id}
        />
      </div>

      {/* Typing Indicator */}
      {getTypingText() && (
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span>{getTypingText()}</span>
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="border-t border-gray-200 p-4">
        <MessageInput
          onSendMessage={handleSendMessage}
          onTyping={handleTyping}
          disabled={isLoading}
        />
      </div>
    </div>
  )
}

export default ChatInterface