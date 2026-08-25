import axios from 'axios'
import api from './api'
import { store } from '@/core/store'
import { logoutUser, setTokens } from '@/store/auth/slices'

// Instancia sin interceptores para la llamada de refresh (evita recursión)
const refreshClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
})

let isRefreshing = false
let pendingRequests = []

const processQueue = (error, token = null) => {
  pendingRequests.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(token)
  })
  pendingRequests = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    if (error?.response?.status !== 401 || original._retry) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingRequests.push({ resolve, reject })
      })
        .then((token) => {
          original.headers.Authorization = `JWT ${token}`
          return api(original)
        })
        .catch((err) => Promise.reject(err))
    }

    original._retry = true
    isRefreshing = true

    try {
      const { auth } = store.getState()
      const response = await refreshClient.post('/auth/jwt/refresh/', { refresh: auth.refreshToken })
      const { access, refresh } = response.data

      store.dispatch(setTokens({ accessToken: access, refreshToken: refresh }))
      original.headers.Authorization = `JWT ${access}`
      original._retry = true
      processQueue(null, access)
      return api(original)
    } catch (refreshError) {
      processQueue(refreshError, null)
      store.dispatch(logoutUser())
      if (typeof window !== 'undefined') window.location.href = '/login'
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)
