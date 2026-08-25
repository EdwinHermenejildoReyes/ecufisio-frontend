/** Elimina caracteres no válidos de un número de teléfono y limita a 15 caracteres. */
export const sanitizeTel = (v: string) => v.replace(/[^\d+\s-]/g, '').slice(0, 15)
