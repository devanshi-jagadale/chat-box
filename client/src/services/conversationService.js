import axios from 'axios'

const API_URL = '/api/conversations'

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

export const conversationService = {
  async getAllConversations() {
    try {
      const response = await api.get('/')
      return response.data.conversations
    } catch (error) {
      throw new Error('Failed to fetch conversations')
    }
  },

  async getConversationById(id) {
    try {
      const response = await api.get(`/${id}`)
      return response.data.conversation
    } catch (error) {
      throw new Error('Failed to fetch conversation')
    }
  },

  async createConversation(data) {
    try {
      const response = await api.post('/', data)
      return response.data.conversation
    } catch (error) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error)
      }
      throw new Error('Failed to create conversation')
    }
  },

  async addParticipants(conversationId, participantIds) {
    try {
      const response = await api.post(`/${conversationId}/participants`, {
        participantIds,
      })
      return response.data
    } catch (error) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error)
      }
      throw new Error('Failed to add participants')
    }
  },

  async removeParticipant(conversationId, userId) {
    try {
      const response = await api.delete(`/${conversationId}/participants/${userId}`)
      return response.data
    } catch (error) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error)
      }
      throw new Error('Failed to remove participant')
    }
  },

  async leaveConversation(conversationId) {
    try {
      const response = await api.delete(`/${conversationId}/leave`)
      return response.data
    } catch (error) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error)
      }
      throw new Error('Failed to leave conversation')
    }
  },
} 