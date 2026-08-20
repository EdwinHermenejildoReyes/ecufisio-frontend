export function getErrorMessage(error) {
  if (error?.response?.data) {
    const data = error.response.data
    if (typeof data === 'string') return data
    if (data.detail) return data.detail
    if (data.non_field_errors) return data.non_field_errors[0]
    const firstKey = Object.keys(data)[0]
    if (firstKey) {
      const msg = data[firstKey]
      return Array.isArray(msg) ? `${firstKey}: ${msg[0]}` : `${firstKey}: ${msg}`
    }
  }
  if (isNetworkError(error)) return 'Sin conexión. Verifica tu internet.'
  if (isServerError(error)) return 'Error del servidor. Intenta de nuevo.'
  return error?.message || 'Ocurrió un error inesperado.'
}

export function isServerError(error) {
  return error?.response?.status >= 500
}

export function isNetworkError(error) {
  return !error?.response && error?.request
}
