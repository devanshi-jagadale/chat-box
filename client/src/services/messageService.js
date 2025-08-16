import axios from 'axios'

const API_URL = '/api/messages'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const messageService = {
  async getMessages(conversationId, page = 1, limit = 50) {
    try {
      const response = await api.get(`/conversation/${conversationId}`, {
        params: { page, limit },
      })
      return response.data
    } catch (error) {
      throw new Error('Failed to fetch messages')
    }
  },

  async sendMessage(data) {
    try {
      const response = await api.post('/', data)
      return response.data.data
    } catch (error) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error)
      }
      throw new Error('Failed to send message')
    }
  },

  async updateMessage(id, content) {
    try {
      const response = await api.put(`/${id}`, { content })
      return response.data.data
    } catch (error) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error)
      }
      throw new Error('Failed to update message')
    }
  },

  async deleteMessage(id) {
    try {
      const response = await api.delete(`/${id}`)
      return response.data
    } catch (error) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error)
      }
      throw new Error('Failed to delete message')
    }
  },

  async markMessagesAsRead(conversationId) {
    try {
      const response = await api.put(`/read/${conversationId}`)
      return response.data
    } catch (error) {
      throw new Error('Failed to mark messages as read')
    }
  },

  async getUnreadCount() {
    try {
      const response = await api.get('/unread/count')
      return response.data
    } catch (error) {
      throw new Error('Failed to get unread count')
    }
  },
} 