import { useState, useEffect, useRef } from 'react'
import { Send, Paperclip, Smile } from 'lucide-react'

const MessageInput = ({ onSendMessage, onTyping, disabled }) => {
  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const textareaRef = useRef(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [message])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!message.trim() || disabled) return

    onSendMessage(message)
    setMessage('')
    setIsTyping(false)
    onTyping(false)
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleInputChange = (e) => {
    const value = e.target.value
    setMessage(value)
    
    // Handle typing indicator
    if (value.length > 0 && !isTyping) {
      setIsTyping(true)
      onTyping(true)
    } else if (value.length === 0 && isTyping) {
      setIsTyping(false)
      onTyping(false)
    }
  }

  const handleFileUpload = () => {
    // TODO: Implement file upload functionality
    console.log('File upload not implemented yet')
  }

  const handleEmojiPicker = () => {
    // TODO: Implement emoji picker functionality
    console.log('Emoji picker not implemented yet')
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end space-x-3">
      {/* File Upload Button */}
      <button
        type="button"
        onClick={handleFileUpload}
        disabled={disabled}
        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Attach file"
      >
        <Paperclip className="h-5 w-5" />
      </button>

      {/* Emoji Picker Button */}
      <button
        type="button"
        onClick={handleEmojiPicker}
        disabled={disabled}
        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Add emoji"
      >
        <Smile className="h-5 w-5" />
      </button>

      {/* Message Input */}
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={disabled}
          className="w-full resize-none border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed min-h-[40px] max-h-32"
          rows={1}
        />
      </div>

      {/* Send Button */}
      <button
        type="submit"
        disabled={!message.trim() || disabled}
        className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title="Send message"
      >
        <Send className="h-5 w-5" />
      </button>
    </form>
  )
}

export default MessageInput 