import axios from 'axios'
import { API_URL } from '@/utils/getEnvVars'
import { getErrorMessage, isServerError, isNetworkError } from '@/utils/errorMessages'

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    try {
      const persisted = JSON.parse(localStorage.getItem('persist:ecufisio') || '{}')
      const auth = JSON.parse(persisted.auth || '{}')
      if (auth.accessToken) {
        config.headers.Authorization = `JWT ${auth.accessToken}`
      }
    } catch {
      // sin token almacenado
    }
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (isServerError(error) || isNetworkError(error)) {
      console.error('[api]', getErrorMessage(error))
    }
    return Promise.reject(error)
  }
)

export default api
