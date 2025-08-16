import axios from 'axios'

const API_URL = '/api/users'

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

export const userService = {
  async getAllUsers() {
    try {
      const response = await api.get('/')
      return response.data.users
    } catch (error) {
      throw new Error('Failed to fetch users')
    }
  },

  async getUserById(id) {
    try {
      const response = await api.get(`/${id}`)
      return response.data.user
    } catch (error) {
      throw new Error('Failed to fetch user')
    }
  },

  async updateProfile(data) {
    try {
      const response = await api.put('/profile', data)
      return response.data.user
    } catch (error) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error)
      }
      throw new Error('Failed to update profile')
    }
  },

  async changePassword(currentPassword, newPassword) {
    try {
      const response = await api.put('/password', {
        currentPassword,
        newPassword,
      })
      return response.data
    } catch (error) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error)
      }
      throw new Error('Failed to change password')
    }
  },

  async searchUsers(query) {
    try {
      const response = await api.get(`/search/${query}`)
      return response.data.users
    } catch (error) {
      throw new Error('Failed to search users')
    }
  },
} 