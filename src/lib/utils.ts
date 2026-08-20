import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatFecha(iso: string): string {
  return new Date(iso).toLocaleDateString('es-EC', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

export function formatHora(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-EC', {
    hour: '2-digit', minute: '2-digit',
  })
}

export function formatMoney(amount: number | string): string {
  return `$${Number(amount).toFixed(2)}`
}
