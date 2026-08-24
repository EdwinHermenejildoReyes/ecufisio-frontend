'use client'

import { useState, useEffect, useRef } from 'react'
import { notificacionesRepository } from '@/repositories/notificaciones'
import { MessageCircle, Mail, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react'

// ─── Constants ────────────────────────────────────────────────────────────────

const CANAL_ICON: Record<string, React.ElementType> = {
  whatsapp: MessageCircle,
  email:    Mail,
}

const CANAL_COLOR: Record<string, string> = {
  whatsapp: 'text-emerald-600 bg-emerald-50',
  email:    'text-blue-600 bg-blue-50',
}

const ESTADO_STYLE: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pendiente: { label: 'Pendiente', color: 'bg-amber-100 text-amber-700',  icon: Clock        },
  enviada:   { label: 'Enviada',   color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  fallida:   { label: 'Fallida',   color: 'bg-red-100 text-red-600',      icon: XCircle      },
}

const TIPO_LABEL: Record<string, string> = {
  recordatorio: 'Recordatorio de cita',
  confirmacion: 'Confirmación de cita',
  cancelacion:  'Cancelación de cita',
  factura:      'Envío de factura',
}

function toList(data: any) {
  if (!data) return []
  return Array.isArray(data) ? data : (data.results || [])
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NotificacionesPage() {
  const [notificaciones, setNotificaciones] = useState<any[]>([])
  const [resumen, setResumen] = useState({ total: 0, pendiente: 0, enviada: 0, fallida: 0 })
  const [loading, setLoading] = useState(true)
  const [reintentando, setReintentando] = useState<number | null>(null)

  // Filtros
  const [estado, setEstado] = useState('')
  const [canal, setCanal]   = useState('')
  const [tipo, setTipo]     = useState('')
  const [q, setQ]           = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const cargar = (params = {}) => {
    setLoading(true)
    Promise.all([
      notificacionesRepository.listar(params).catch(() => null),
      notificacionesRepository.resumen().catch(() => null),
    ]).then(([data, res]) => {
      setNotificaciones(toList(data))
      if (res) setResumen(res)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { cargar() }, [])

  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      cargar({
        estado:  estado || undefined,
        canal:   canal  || undefined,
        tipo:    tipo   || undefined,
        q:       q      || undefined,
      })
    }, 300)
  }, [estado, canal, tipo, q])

  const handleReintentar = async (id: number) => {
    setReintentando(id)
    try {
      await notificacionesRepository.reintentar(id)
      cargar({ estado: estado || undefined, canal: canal || undefined, tipo: tipo || undefined, q: q || undefined })
    } catch {} finally {
      setReintentando(null)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Notificaciones</h1>
        <p className="text-sm text-gray-500 mt-0.5">Registro de mensajes enviados a pacientes</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total',     value: resumen.total,     color: 'text-gray-900' },
          { label: 'Enviadas',  value: resumen.enviada,   color: 'text-emerald-600' },
          { label: 'Pendientes',value: resumen.pendiente, color: 'text-amber-600' },
          { label: 'Fallidas',  value: resumen.fallida,   color: 'text-red-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Buscar paciente..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="input w-48"
        />

        <select className="input w-36" value={estado} onChange={(e) => setEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="enviada">Enviada</option>
          <option value="fallida">Fallida</option>
        </select>

        <select className="input w-36" value={canal} onChange={(e) => setCanal(e.target.value)}>
          <option value="">Todos los canales</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="email">Email</option>
        </select>

        <select className="input w-44" value={tipo} onChange={(e) => setTipo(e.target.value)}>
          <option value="">Todos los tipos</option>
          <option value="recordatorio">Recordatorio</option>
          <option value="confirmacion">Confirmación</option>
          <option value="cancelacion">Cancelación</option>
          <option value="factura">Factura</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-7 h-7 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notificaciones.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-12">No se encontraron notificaciones.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-400 font-medium uppercase tracking-wide">
                <th className="text-left px-5 py-3">Paciente</th>
                <th className="text-left px-5 py-3">Tipo</th>
                <th className="text-left px-4 py-3">Canal</th>
                <th className="text-left px-4 py-3">Estado</th>
                <th className="text-left px-4 py-3">Intentos</th>
                <th className="text-left px-5 py-3">Fecha</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {notificaciones.map((n) => {
                const CanalIcon  = CANAL_ICON[n.canal] || Mail
                const estadoInfo = ESTADO_STYLE[n.estado] || ESTADO_STYLE.pendiente
                const EstadoIcon = estadoInfo.icon
                const fecha      = new Date(n.created_at)

                return (
                  <tr key={n.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-gray-900">{n.paciente_nombre || '—'}</p>
                      <p className="text-xs text-gray-400">
                        {n.destinatario_email || n.destinatario_telefono || '—'}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">
                      {TIPO_LABEL[n.tipo] || n.tipo}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${CANAL_COLOR[n.canal] || 'bg-gray-100 text-gray-600'}`}>
                        <CanalIcon size={11} />
                        {n.canal_display}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${estadoInfo.color}`}>
                        <EstadoIcon size={11} />
                        {estadoInfo.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 text-center">
                      {n.intentos}
                    </td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs whitespace-nowrap">
                      {fecha.toLocaleDateString('es-EC')}{' '}
                      {fecha.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-3.5">
                      {n.estado === 'fallida' && (
                        <button
                          onClick={() => handleReintentar(n.id)}
                          disabled={reintentando === n.id}
                          className="flex items-center gap-1.5 text-xs text-sky-600 hover:underline disabled:opacity-50"
                        >
                          <RefreshCw size={11} className={reintentando === n.id ? 'animate-spin' : ''} />
                          Reintentar
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
