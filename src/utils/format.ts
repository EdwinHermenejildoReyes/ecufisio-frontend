/** Elimina caracteres no válidos de un número de teléfono. Permite dígitos, +, espacios y guiones. */
export const sanitizeTel = (v: string) => v.replace(/[^\d+\s-]/g, '')
