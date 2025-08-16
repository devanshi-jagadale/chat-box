import { createContext, useContext, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

const SocketContext = createContext()

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

export const SocketProvider = ({ children }) => {
  const { user } = useAuth()
  const socketRef = useRef(null)

  useEffect(() => {
    if (user && !socketRef.current) {
      socketRef.current = io('http://localhost:5000', {
        transports: ['websocket'],
        autoConnect: false
      })

      socketRef.current.connect()

      const token = localStorage.getItem('token')
      if (token) {
        socketRef.current.emit('authenticate', token)
      }

      socketRef.current.on('connect', () => {
        console.log('Connected to server')
      })

      socketRef.current.on('disconnect', () => {
        console.log('Disconnected from server')
      })

      socketRef.current.on('connect_error', (error) => {
        console.error('Connection error:', error)
        toast.error('Failed to connect to server')
      })

      socketRef.current.on('authError', (error) => {
        console.error('Authentication error:', error)
        toast.error('Authentication failed')
      })

      socketRef.current.on('userStatusChanged', (data) => {
        console.log('User status changed:', data)
      })
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [user])

  // All socket methods use socketRef.current
  const joinConversation = (conversationId) => {
    socketRef.current?.emit('joinConversation', conversationId)
  }

  const leaveConversation = (conversationId) => {
    socketRef.current?.emit('leaveConversation', conversationId)
  }

  const sendMessage = (data) => {
    socketRef.current?.emit('sendMessage', data)
  }

  const startTyping = ({ conversationId }) => {
    socketRef.current?.emit('typing', { conversationId })
  }

  const stopTyping = ({ conversationId }) => {
    socketRef.current?.emit('stopTyping', { conversationId })
  }

  const onNewMessage = (callback) => {
    socketRef.current?.on('newMessage', callback)
  }

  const onUserTyping = (callback) => {
    socketRef.current?.on('userTyping', callback)
  }

  const onUserStopTyping = (callback) => {
    socketRef.current?.on('userStopTyping', callback)
  }

  const onUserStatusChanged = (callback) => {
    socketRef.current?.on('userStatusChanged', callback)
  }

  const removeListener = (event, callback) => {
    socketRef.current?.off(event, callback)
  }

  // Move value here so it always uses the latest socketRef.current
  const value = {
    socket: socketRef.current,
    joinConversation,
    leaveConversation,
    sendMessage,
    startTyping,
    stopTyping,
    onNewMessage,
    onUserTyping,
    onUserStopTyping,
    onUserStatusChanged,
    removeListener
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}