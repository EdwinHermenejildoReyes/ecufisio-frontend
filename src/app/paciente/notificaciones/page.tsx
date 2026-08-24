'use client'

import { useEffect, useState } from 'react'
import { notificacionesRepository } from '@/repositories/notificaciones'
import { MessageCircle, Mail, CheckCircle, XCircle, Clock } from 'lucide-react'

const CANAL_ICON: Record<string, React.ElementType> = { whatsapp: MessageCircle, email: Mail }
const ESTADO_ICON: Record<string, React.ElementType> = {
  enviada: CheckCircle, fallida: XCircle, pendiente: Clock,
}
const ESTADO_COLOR: Record<string, string> = {
  enviada:   'text-emerald-500',
  fallida:   'text-red-500',
  pendiente: 'text-amber-500',
}
const TIPO_LABEL: Record<string, string> = {
  recordatorio: 'Recordatorio de cita',
  confirmacion: 'Confirmación de cita',
  cancelacion:  'Cancelación de cita',
  factura:      'Envío de factura',
}

function toList(data: any): any[] {
  if (!data) return []
  return Array.isArray(data) ? data : (data.results || [])
}

export default function NotificacionesPacientePage() {
  const [notificaciones, setNotificaciones] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    notificacionesRepository.listar({})
      .then((d) => setNotificaciones(toList(d)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-7 h-7 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4 py-2">
      <h2 className="text-lg font-bold text-gray-900">Mis notificaciones</h2>
      <p className="text-xs text-gray-400">Mensajes enviados por la clínica</p>

      {notificaciones.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-sm text-gray-400">
          No tienes notificaciones registradas.
        </div>
      ) : (
        <div className="space-y-3">
          {notificaciones.map((n) => {
            const CanalIcon  = CANAL_ICON[n.canal]  || Mail
            const EstadoIcon = ESTADO_ICON[n.estado] || Clock
            const fecha = new Date(n.created_at)

            return (
              <div key={n.id} className="bg-white rounded-2xl border border-gray-200 p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CanalIcon size={14} className="text-gray-400" />
                    <p className="text-sm font-medium text-gray-900">
                      {TIPO_LABEL[n.tipo] || n.tipo}
                    </p>
                  </div>
                  <span className={`flex items-center gap-1 text-xs font-medium ${ESTADO_COLOR[n.estado] || 'text-gray-400'}`}>
                    <EstadoIcon size={12} />
                    {n.estado_display}
                  </span>
                </div>

                {n.mensaje && (
                  <p className="text-xs text-gray-500 leading-relaxed">{n.mensaje}</p>
                )}

                <p className="text-[10px] text-gray-300">
                  {fecha.toLocaleDateString('es-EC', {
                    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
                  })}{' '}
                  · {fecha.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
