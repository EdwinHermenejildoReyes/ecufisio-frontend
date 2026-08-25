export const sanitizeTel = (v: string) => v.replace(/[^\d+\s-]/g, '').slice(0, 15)

export const sanitizeCedula = (v: string) => v.replace(/\D/g, '').slice(0, 10)

export function validateCedula(cedula: string): boolean {
  if (!/^\d{10}$/.test(cedula)) return false
  const provincia = parseInt(cedula.substring(0, 2), 10)
  if (provincia < 1 || provincia > 24) return false
  if (parseInt(cedula[2], 10) >= 6) return false
  const coef = [2, 1, 2, 1, 2, 1, 2, 1, 2]
  let suma = 0
  for (let i = 0; i < 9; i++) {
    let val = parseInt(cedula[i], 10) * coef[i]
    if (val >= 10) val -= 9
    suma += val
  }
  const verificador = suma % 10 === 0 ? 0 : 10 - (suma % 10)
  return verificador === parseInt(cedula[9], 10)
}
