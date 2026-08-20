export function getEnvVar(key) {
  const value = process.env[key]
  if (!value && process.env.NODE_ENV !== 'test') {
    console.warn(`[ecufisio] Variable de entorno no definida: ${key}`)
  }
  return value || ''
}

export const API_URL = getEnvVar('NEXT_PUBLIC_API_URL')
export const WEB_URL = getEnvVar('NEXT_PUBLIC_WEB_URL')
