'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Bell, MessageCircle, Mail, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react'
import { notificacionesRepository } from '@/repositories/notificaciones'

const CANAL_ICON: Record<string, React.ElementType> = {
  whatsapp: MessageCircle,
  email:    Mail,
}

const ESTADO_STYLE: Record<string, { color: string; icon: React.ElementType }> = {
  pendiente: { color: 'text-amber-500',  icon: Clock       },
  enviada:   { color: 'text-emerald-500',icon: CheckCircle },
  fallida:   { color: 'text-red-500',    icon: XCircle     },
}

const TIPO_LABEL: Record<string, string> = {
  recordatorio: 'Recordatorio de cita',
  confirmacion: 'Confirmación de cita',
  cancelacion:  'Cancelación',
  factura:      'Envío de factura',
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)   return 'ahora'
  if (m < 60)  return `hace ${m}m`
  const h = Math.floor(m / 60)
  if (h < 24)  return `hace ${h}h`
  return `hace ${Math.floor(h / 24)}d`
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [fallidas, setFallidas] = useState(0)
  const [recientes, setRecientes] = useState<any[]>([])
  const [reintentando, setReintentando] = useState<number | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  const cargar = useCallback(async () => {
    try {
      const [resumen, lista] = await Promise.all([
        notificacionesRepository.resumen().catch(() => ({ fallida: 0 })),
        notificacionesRepository.recientes().catch(() => []),
      ])
      setFallidas(resumen.fallida || 0)
      setRecientes(Array.isArray(lista) ? lista : [])
    } catch {}
  }, [])

  useEffect(() => {
    cargar()
    const interval = setInterval(cargar, 60_000)
    return () => clearInterval(interval)
  }, [cargar])

  // Click outside to close
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handleReintentar = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setReintentando(id)
    try {
      await notificacionesRepository.reintentar(id)
      cargar()
    } catch {} finally {
      setReintentando(null)
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        title="Notificaciones"
      >
        <Bell size={17} />
        {fallidas > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {fallidas > 9 ? '9+' : fallidas}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 bottom-10 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900">Notificaciones</p>
            {fallidas > 0 && (
              <span className="text-xs bg-red-100 text-red-600 font-medium px-2 py-0.5 rounded-full">
                {fallidas} fallida{fallidas !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* List */}
          <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
            {recientes.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">Sin notificaciones recientes</p>
            ) : (
              recientes.map((n) => {
                const CanalIcon  = CANAL_ICON[n.canal] || Bell
                const estadoInfo = ESTADO_STYLE[n.estado] || ESTADO_STYLE.pendiente
                const EstadoIcon = estadoInfo.icon

                return (
                  <div key={n.id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-2.5">
                      <CanalIcon size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-medium text-gray-800 truncate">
                            {n.paciente_nombre || 'Paciente'}
                          </p>
                          <span className="text-[10px] text-gray-400 flex-shrink-0">
                            {timeAgo(n.created_at)}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          {TIPO_LABEL[n.tipo] || n.tipo}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <span className={`flex items-center gap-1 text-[10px] font-medium ${estadoInfo.color}`}>
                            <EstadoIcon size={10} />
                            {n.estado_display}
                          </span>
                          {n.estado === 'fallida' && (
                            <button
                              onClick={(e) => handleReintentar(n.id, e)}
                              disabled={reintentando === n.id}
                              className="flex items-center gap-1 text-[10px] text-sky-600 hover:underline disabled:opacity-50"
                            >
                              <RefreshCw size={9} className={reintentando === n.id ? 'animate-spin' : ''} />
                              Reintentar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 px-4 py-2.5">
            <a
              href="/dashboard/notificaciones"
              className="text-xs text-sky-600 hover:underline font-medium"
              onClick={() => setOpen(false)}
            >
              Ver registro completo →
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
