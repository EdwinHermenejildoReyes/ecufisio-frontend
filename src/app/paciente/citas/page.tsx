'use client'

import { useEffect, useState } from 'react'
import { agendaRepository } from '@/repositories/agenda'
import { Calendar, Clock, User, AlertCircle } from 'lucide-react'

const ESTADO_LABEL: Record<string, string> = {
  pendiente: 'Pendiente', confirmada: 'Confirmada', en_curso: 'En curso',
  completada: 'Completada', cancelada: 'Cancelada', no_asistio: 'No asistió',
}
const ESTADO_COLOR: Record<string, string> = {
  pendiente:  'bg-amber-100 text-amber-700',
  confirmada: 'bg-sky-100 text-sky-700',
  en_curso:   'bg-emerald-100 text-emerald-700',
  completada: 'bg-gray-100 text-gray-500',
  cancelada:  'bg-red-100 text-red-600',
  no_asistio: 'bg-red-100 text-red-600',
}

function toList(data: any): any[] {
  if (!data) return []
  return Array.isArray(data) ? data : (data.results || [])
}

export default function CitasPacientePage() {
  const [citas, setCitas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelando, setCancelando] = useState<number | null>(null)
  const [mensaje, setMensaje] = useState('')

  const cargar = () =>
    agendaRepository.listarCitas({ ordering: 'fecha_hora' })
      .then((d) => setCitas(toList(d)))
      .catch(() => {})
      .finally(() => setLoading(false))

  useEffect(() => { cargar() }, [])

  const handleCancelar = async (id: number) => {
    setCancelando(id)
    try {
      await agendaRepository.cancelarCita(id)
      setMensaje('Cita cancelada correctamente.')
      cargar()
    } catch {
      setMensaje('No se pudo cancelar la cita.')
    } finally {
      setCancelando(null)
      setTimeout(() => setMensaje(''), 3000)
    }
  }

  const ahora = new Date()
  const proximas = citas.filter(
    (c) => ['pendiente', 'confirmada', 'en_curso'].includes(c.estado) && new Date(c.fecha_hora) >= ahora
  )
  const pasadas = citas.filter(
    (c) => !proximas.includes(c)
  ).sort((a, b) => new Date(b.fecha_hora).getTime() - new Date(a.fecha_hora).getTime())

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-7 h-7 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-5 py-2">
      <h2 className="text-lg font-bold text-gray-900">Mis citas</h2>

      {mensaje && (
        <div className="flex items-center gap-2 bg-sky-50 border border-sky-200 text-sky-700 text-sm rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {mensaje}
        </div>
      )}

      {/* Próximas */}
      <section>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
          Próximas ({proximas.length})
        </p>
        {proximas.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center text-sm text-gray-400">
            No tienes citas próximas.
          </div>
        ) : (
          <div className="space-y-3">
            {proximas.map((c) => (
              <CitaCard
                key={c.id}
                cita={c}
                canCancel
                cancelando={cancelando === c.id}
                onCancelar={() => handleCancelar(c.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Historial */}
      {pasadas.length > 0 && (
        <section>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Historial ({pasadas.length})
          </p>
          <div className="space-y-3">
            {pasadas.slice(0, 10).map((c) => (
              <CitaCard key={c.id} cita={c} canCancel={false} cancelando={false} onCancelar={() => {}} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function CitaCard({
  cita, canCancel, cancelando, onCancelar,
}: {
  cita: any
  canCancel: boolean
  cancelando: boolean
  onCancelar: () => void
}) {
  const fecha = new Date(cita.fecha_hora)
  const esCancelable = canCancel && ['pendiente', 'confirmada'].includes(cita.estado)

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-gray-900 text-sm">
            {cita.servicio_nombre || 'Sesión de fisioterapia'}
          </p>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {fecha.toLocaleDateString('es-EC', { weekday: 'short', day: 'numeric', month: 'short' })}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {fecha.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${ESTADO_COLOR[cita.estado] || 'bg-gray-100 text-gray-600'}`}>
          {ESTADO_LABEL[cita.estado] || cita.estado}
        </span>
      </div>

      {cita.fisioterapeuta_nombre && (
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <User className="w-3.5 h-3.5" />
          {cita.fisioterapeuta_nombre}
        </div>
      )}

      {esCancelable && (
        <button
          onClick={onCancelar}
          disabled={cancelando}
          className="w-full text-xs text-red-500 border border-red-200 rounded-xl py-2 hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          {cancelando ? 'Cancelando...' : 'Cancelar cita'}
        </button>
      )}
    </div>
  )
}
