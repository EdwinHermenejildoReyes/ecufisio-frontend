function warnIfMissing(value, key) {
  if (!value && process.env.NODE_ENV !== 'test') {
    console.warn(`[FisioCore] Variable de entorno no definida: ${key}`)
  }
  return value || ''
}

export const API_URL = warnIfMissing(process.env.NEXT_PUBLIC_API_URL, 'NEXT_PUBLIC_API_URL')
export const WEB_URL = warnIfMissing(process.env.NEXT_PUBLIC_WEB_URL, 'NEXT_PUBLIC_WEB_URL')
