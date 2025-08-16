import axios from 'axios'

const API_URL = 'http://localhost:5000/api/auth' 


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

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authService = {
  async register(email, username, password) {
    try {
      const response = await api.post('/register', {
        email,
        username,
        password,
      })
      return response.data
    } catch (error) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error)
      }
      throw new Error('Registration failed')
    }
  },

  async login(email, password) {
    try {
      const response = await api.post('/login', {
        email,
        password,
      })
      return response.data
    } catch (error) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error)
      }
      throw new Error('Login failed')
    }
  },

  async getCurrentUser() {
    try {
      const response = await api.get('/me')
      return response.data.user
    } catch (error) {
      throw new Error('Failed to get current user')
    }
  },

  async logout() {
    localStorage.removeItem('token')
  },
} 