import api from './api'
import { store } from '@/core/store'
import { logoutUser, setTokens } from '@/store/auth/slices'

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
      const response = await api.post('/auth/jwt/refresh/', { refresh: auth.refreshToken })
      const { access } = response.data

      store.dispatch(setTokens({ accessToken: access }))
      original.headers.Authorization = `JWT ${access}`
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
