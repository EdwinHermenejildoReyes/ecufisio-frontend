'use client'

import { useEffect, useState, useCallback } from 'react'
import { Calendar, dateFnsLocalizer, Views, View } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay, addDays, startOfDay } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Plus, ChevronLeft, ChevronRight, X, Calendar as CalIcon,
  Clock, User, MapPin, FileText, CheckCircle2, XCircle,
  AlertCircle, Loader2, RefreshCw,
} from 'lucide-react'
import { agendaRepository } from '@/repositories/agenda'
import 'react-big-calendar/lib/css/react-big-calendar.css'

/* ── Localizer ── */
const locales = { es }
const localizer = dateFnsLocalizer({ format, parse, startOfWeek: (d: Date) => startOfWeek(d, { weekStartsOn: 1 }), getDay, locales })

const MESSAGES = {
  today: 'Hoy', previous: 'Anterior', next: 'Siguiente',
  month: 'Mes', week: 'Semana', day: 'Día', agenda: 'Lista',
  date: 'Fecha', time: 'Hora', event: 'Cita',
  noEventsInRange: 'No hay citas en este período.',
  showMore: (n: number) => `+${n} más`,
}

/* ── Tipos ── */
interface CitaEvento {
  id: string
  title: string
  start: Date
  end: Date
  resource: CitaAPI
}

interface CitaAPI {
  id: string
  paciente_nombre: string
  fisioterapeuta_nombre: string
  servicio_nombre: string
  servicio_color: string
  sala_nombre: string | null
  fecha_hora: string
  fecha_hora_fin: string
  duracion_minutos: number
  estado: string
  origen: string
}

interface CitaDetalle extends CitaAPI {
  notas_paciente: string
  notas_internas: string
  paciente: { id: string; nombre_completo: string; cedula: string }
  fisioterapeuta: { id: string; nombre_completo: string }
  servicio: { id: string; nombre: string; duracion_minutos: number; precio: string; color: string }
  sala: { id: string; nombre: string } | null
}

interface Fisioterapeuta {
  id: string
  nombre_completo: string
  email: string
}

/* ── Estado badge ── */
const ESTADO_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  pendiente:   { label: 'Pendiente',   bg: 'bg-amber-100',  text: 'text-amber-700' },
  confirmada:  { label: 'Confirmada',  bg: 'bg-sky-100',    text: 'text-sky-700' },
  en_curso:    { label: 'En curso',    bg: 'bg-emerald-100',text: 'text-emerald-700' },
  completada:  { label: 'Completada',  bg: 'bg-gray-100',   text: 'text-gray-600' },
  cancelada:   { label: 'Cancelada',   bg: 'bg-red-100',    text: 'text-red-600' },
  no_asistio:  { label: 'No asistió',  bg: 'bg-red-100',    text: 'text-red-600' },
}

function EstadoBadge({ estado }: { estado: string }) {
  const cfg = ESTADO_CONFIG[estado] ?? { label: estado, bg: 'bg-gray-100', text: 'text-gray-600' }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  )
}

/* ── Formulario de nueva cita ── */
interface NuevaCitaForm {
  paciente_id: string
  fisioterapeuta_id: string
  fecha_hora: string
  duracion_minutos: string
  notas_paciente: string
  notas_internas: string
}

const FORM_EMPTY: NuevaCitaForm = {
  paciente_id: '', fisioterapeuta_id: '', fecha_hora: '',
  duracion_minutos: '60', notas_paciente: '', notas_internas: '',
}

/* ── Modal de nueva cita ── */
function NuevaCitaModal({
  open, onClose, onSaved, fisioterapeutas, initialDateTime,
}: {
  open: boolean
  onClose: () => void
  onSaved: () => void
  fisioterapeutas: Fisioterapeuta[]
  initialDateTime?: Date
}) {
  const [form, setForm] = useState<NuevaCitaForm>(FORM_EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      const dt = initialDateTime
        ? format(initialDateTime, "yyyy-MM-dd'T'HH:mm")
        : ''
      setForm({ ...FORM_EMPTY, fecha_hora: dt })
      setError(null)
    }
  }, [open, initialDateTime])

  const set = (field: keyof NuevaCitaForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.paciente_id || !form.fisioterapeuta_id || !form.fecha_hora) {
      setError('Completa los campos obligatorios.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await agendaRepository.crearCita({
        paciente: form.paciente_id,
        fisioterapeuta: form.fisioterapeuta_id,
        fecha_hora: form.fecha_hora,
        duracion_minutos: parseInt(form.duracion_minutos),
        notas_paciente: form.notas_paciente,
        notas_internas: form.notas_internas,
      })
      onSaved()
      onClose()
    } catch (err: any) {
      const data = err?.response?.data
      if (data?.fecha_hora) setError(data.fecha_hora[0] ?? data.fecha_hora)
      else if (data?.detail) setError(data.detail)
      else setError('No se pudo guardar la cita.')
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Nueva cita</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID Paciente <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.paciente_id}
              onChange={set('paciente_id')}
              placeholder="UUID del paciente"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-400 mt-1">Módulo de búsqueda de pacientes próximamente</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fisioterapeuta <span className="text-red-400">*</span>
            </label>
            <select
              value={form.fisioterapeuta_id}
              onChange={set('fisioterapeuta_id')}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            >
              <option value="">Seleccionar fisioterapeuta</option>
              {fisioterapeutas.map((f) => (
                <option key={f.id} value={f.id}>{f.nombre_completo}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha y hora <span className="text-red-400">*</span>
              </label>
              <input
                type="datetime-local"
                value={form.fecha_hora}
                onChange={set('fecha_hora')}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duración (min)</label>
              <select
                value={form.duracion_minutos}
                onChange={set('duracion_minutos')}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              >
                {[30, 45, 60, 90, 120].map((m) => (
                  <option key={m} value={m}>{m} min</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas para el paciente</label>
            <textarea
              value={form.notas_paciente}
              onChange={set('notas_paciente')}
              rows={2}
              placeholder="Indicaciones previas, preparación…"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas internas</label>
            <textarea
              value={form.notas_internas}
              onChange={set('notas_internas')}
              rows={2}
              placeholder="Observaciones del equipo clínico…"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-70"
            >
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Guardando…</> : 'Guardar cita'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Modal de detalle ── */
function DetalleCitaModal({
  citaId, onClose, onUpdated,
}: {
  citaId: string | null
  onClose: () => void
  onUpdated: () => void
}) {
  const [cita, setCita] = useState<CitaDetalle | null>(null)
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    if (!citaId) return
    setLoading(true)
    agendaRepository.obtenerCita(citaId)
      .then(setCita)
      .catch(() => setCita(null))
      .finally(() => setLoading(false))
  }, [citaId])

  const doAction = async (action: 'confirmar' | 'completar' | 'cancelar') => {
    if (!citaId) return
    setActionLoading(action)
    try {
      if (action === 'confirmar') await agendaRepository.confirmarCita(citaId)
      else if (action === 'completar') await agendaRepository.completarCita(citaId)
      else await agendaRepository.cancelarCita(citaId)
      onUpdated()
      onClose()
    } catch {
      // noop — error handled gracefully
    } finally {
      setActionLoading(null)
    }
  }

  if (!citaId) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Detalle de cita</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {loading && (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-sky-500" />
            </div>
          )}

          {!loading && cita && (
            <div className="space-y-4">
              {/* Estado */}
              <div className="flex items-center justify-between">
                <EstadoBadge estado={cita.estado} />
                <span className="text-xs text-gray-400 capitalize">{cita.origen}</span>
              </div>

              {/* Servicio */}
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: cita.servicio?.color ?? '#3B82F6' }}
                />
                <span className="font-semibold text-gray-900">{cita.servicio?.nombre}</span>
                <span className="text-sm text-gray-400">({cita.servicio?.duracion_minutos} min)</span>
              </div>

              {/* Info rows */}
              <div className="space-y-2.5 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <User className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>{cita.paciente?.nombre_completo}</span>
                  {cita.paciente?.cedula && (
                    <span className="text-gray-400">CI: {cita.paciente.cedula}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <User className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>{cita.fisioterapeuta?.nombre_completo}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <CalIcon className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>
                    {format(new Date(cita.fecha_hora), "EEEE d 'de' MMMM, HH:mm", { locale: es })}
                    {' – '}
                    {format(new Date(cita.fecha_hora_fin), 'HH:mm')}
                  </span>
                </div>
                {cita.sala && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                    <span>{cita.sala.nombre}</span>
                  </div>
                )}
                {cita.notas_paciente && (
                  <div className="flex gap-2 text-gray-600">
                    <FileText className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                    <p>{cita.notas_paciente}</p>
                  </div>
                )}
                {cita.notas_internas && (
                  <div className="flex gap-2 text-gray-600 bg-amber-50 p-2 rounded-lg">
                    <FileText className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-amber-800 text-xs">{cita.notas_internas}</p>
                  </div>
                )}
              </div>

              {/* Acciones */}
              {cita.estado === 'pendiente' && (
                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => doAction('confirmar')}
                    disabled={!!actionLoading}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
                  >
                    {actionLoading === 'confirmar'
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <CheckCircle2 className="w-4 h-4" />}
                    Confirmar
                  </button>
                  <button
                    onClick={() => doAction('cancelar')}
                    disabled={!!actionLoading}
                    className="flex-1 flex items-center justify-center gap-1.5 border border-red-200 text-red-600 hover:bg-red-50 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
                  >
                    {actionLoading === 'cancelar'
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <XCircle className="w-4 h-4" />}
                    Cancelar
                  </button>
                </div>
              )}

              {cita.estado === 'confirmada' && (
                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => doAction('completar')}
                    disabled={!!actionLoading}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
                  >
                    {actionLoading === 'completar'
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <CheckCircle2 className="w-4 h-4" />}
                    Completar
                  </button>
                  <button
                    onClick={() => doAction('cancelar')}
                    disabled={!!actionLoading}
                    className="flex-1 flex items-center justify-center gap-1.5 border border-red-200 text-red-600 hover:bg-red-50 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
                  >
                    {actionLoading === 'cancelar'
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <XCircle className="w-4 h-4" />}
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Página principal ── */
export default function AgendaPage() {
  const [view, setView] = useState<View>(Views.WEEK)
  const [date, setDate] = useState(new Date())
  const [events, setEvents] = useState<CitaEvento[]>([])
  const [loading, setLoading] = useState(false)
  const [fisioterapeutas, setFisioterapeutas] = useState<Fisioterapeuta[]>([])
  const [filtroFisio, setFiltroFisio] = useState('')
  const [detalleCitaId, setDetalleCitaId] = useState<string | null>(null)
  const [modalNuevaCita, setModalNuevaCita] = useState(false)
  const [slotSeleccionado, setSlotSeleccionado] = useState<Date | undefined>(undefined)

  /* Cargar fisioterapeutas */
  useEffect(() => {
    agendaRepository.listarFisioterapeutas()
      .then(setFisioterapeutas)
      .catch(() => {})
  }, [])

  /* Cargar citas según rango visible */
  const cargarCitas = useCallback(async (rangeDate: Date, currentView: View, fisioId: string) => {
    setLoading(true)
    try {
      let fecha_inicio: string
      let fecha_fin: string

      if (currentView === Views.MONTH) {
        const start = new Date(rangeDate.getFullYear(), rangeDate.getMonth(), 1)
        const end = new Date(rangeDate.getFullYear(), rangeDate.getMonth() + 1, 0)
        fecha_inicio = format(start, 'yyyy-MM-dd')
        fecha_fin = format(end, 'yyyy-MM-dd')
      } else if (currentView === Views.WEEK) {
        const start = startOfWeek(rangeDate, { weekStartsOn: 1 })
        fecha_inicio = format(start, 'yyyy-MM-dd')
        fecha_fin = format(addDays(start, 6), 'yyyy-MM-dd')
      } else {
        fecha_inicio = format(rangeDate, 'yyyy-MM-dd')
        fecha_fin = fecha_inicio
      }

      const params: Record<string, string> = { fecha_inicio, fecha_fin }
      if (fisioId) params.fisioterapeuta = fisioId

      const data: CitaAPI[] = await agendaRepository.listarCitas(params)
      setEvents(
        data.map((c) => ({
          id: c.id,
          title: `${c.paciente_nombre} — ${c.servicio_nombre}`,
          start: new Date(c.fecha_hora),
          end: new Date(c.fecha_hora_fin),
          resource: c,
        }))
      )
    } catch {
      setEvents([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    cargarCitas(date, view, filtroFisio)
  }, [date, view, filtroFisio, cargarCitas])

  const handleSelectEvent = (event: CitaEvento) => {
    setDetalleCitaId(event.id)
  }

  const handleSelectSlot = ({ start }: { start: Date }) => {
    setSlotSeleccionado(start)
    setModalNuevaCita(true)
  }

  const eventStyleGetter = (event: CitaEvento) => {
    const color = event.resource.servicio_color ?? '#3B82F6'
    const estado = event.resource.estado
    const opacity = estado === 'cancelada' || estado === 'no_asistio' ? 0.45 : 1
    return {
      style: {
        backgroundColor: color,
        borderColor: color,
        opacity,
        color: '#fff',
        borderRadius: '6px',
        fontSize: '12px',
        padding: '2px 6px',
      },
    }
  }

  /* Navegación */
  const irHoy = () => setDate(new Date())
  const irAnterior = () => {
    if (view === Views.MONTH) setDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
    else if (view === Views.WEEK) setDate((d) => addDays(d, -7))
    else setDate((d) => addDays(d, -1))
  }
  const irSiguiente = () => {
    if (view === Views.MONTH) setDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))
    else if (view === Views.WEEK) setDate((d) => addDays(d, 7))
    else setDate((d) => addDays(d, 1))
  }

  const tituloFecha = () => {
    if (view === Views.MONTH) return format(date, 'MMMM yyyy', { locale: es })
    if (view === Views.WEEK) {
      const start = startOfWeek(date, { weekStartsOn: 1 })
      return `${format(start, 'd MMM', { locale: es })} – ${format(addDays(start, 6), 'd MMM yyyy', { locale: es })}`
    }
    return format(date, "EEEE d 'de' MMMM yyyy", { locale: es })
  }

  return (
    <div className="flex flex-col h-full">
      {/* ── Barra superior ── */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Título + navegación */}
          <div className="flex items-center gap-3">
            <button
              onClick={irAnterior}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900 capitalize min-w-[200px] text-center">
              {tituloFecha()}
            </h1>
            <button
              onClick={irSiguiente}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={irHoy}
              className="px-3 py-1.5 text-sm font-medium text-sky-600 border border-sky-200 rounded-lg hover:bg-sky-50 transition-colors"
            >
              Hoy
            </button>
          </div>

          {/* Filtros + acciones */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Selector de vista */}
            <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
              {([Views.DAY, Views.WEEK, Views.MONTH] as View[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-3 py-1.5 font-medium transition-colors ${
                    view === v
                      ? 'bg-sky-600 text-white'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {v === Views.DAY ? 'Día' : v === Views.WEEK ? 'Semana' : 'Mes'}
                </button>
              ))}
            </div>

            {/* Filtro fisioterapeuta */}
            {fisioterapeutas.length > 0 && (
              <select
                value={filtroFisio}
                onChange={(e) => setFiltroFisio(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              >
                <option value="">Todos los fisios</option>
                {fisioterapeutas.map((f) => (
                  <option key={f.id} value={f.id}>{f.nombre_completo}</option>
                ))}
              </select>
            )}

            {/* Refresh */}
            <button
              onClick={() => cargarCitas(date, view, filtroFisio)}
              disabled={loading}
              className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50"
              title="Actualizar"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {/* Nueva cita */}
            <button
              onClick={() => { setSlotSeleccionado(undefined); setModalNuevaCita(true) }}
              className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nueva cita
            </button>
          </div>
        </div>
      </div>

      {/* ── Calendario ── */}
      <div className="flex-1 p-4 min-h-0">
        <style>{`
          .rbc-calendar { font-family: inherit; }
          .rbc-toolbar { display: none; }
          .rbc-header { font-size: 12px; font-weight: 600; color: #6b7280; padding: 8px 4px; }
          .rbc-today { background-color: #f0f9ff; }
          .rbc-event { border-radius: 6px !important; }
          .rbc-event:focus { outline: none; box-shadow: 0 0 0 2px #0ea5e9; }
          .rbc-slot-selection { background-color: rgba(14,165,233,0.15); }
          .rbc-time-content { border-top: 1px solid #e5e7eb; }
          .rbc-timeslot-group { border-bottom-color: #f3f4f6; }
          .rbc-time-slot { color: #9ca3af; font-size: 11px; }
          .rbc-off-range-bg { background: #f9fafb; }
          .rbc-show-more { color: #0ea5e9; font-weight: 500; }
        `}</style>
        <Calendar
          localizer={localizer}
          events={events}
          view={view}
          date={date}
          onNavigate={setDate}
          onView={setView}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
          messages={MESSAGES}
          culture="es"
          eventPropGetter={eventStyleGetter}
          style={{ height: '100%' }}
          step={30}
          timeslots={2}
          min={new Date(2024, 0, 1, 7, 0)}
          max={new Date(2024, 0, 1, 21, 0)}
          formats={{
            dayFormat: (date, culture, localizer) =>
              localizer!.format(date, 'EEE d', culture),
            timeGutterFormat: (date, culture, localizer) =>
              localizer!.format(date, 'HH:mm', culture),
            eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
              `${localizer!.format(start, 'HH:mm', culture)} – ${localizer!.format(end, 'HH:mm', culture)}`,
          }}
          components={{
            event: ({ event }: { event: CitaEvento }) => (
              <div className="truncate text-xs leading-tight">
                <Clock className="w-3 h-3 inline mr-0.5 opacity-80" />
                {format(event.start, 'HH:mm')} · {event.resource.paciente_nombre}
              </div>
            ),
          }}
        />
      </div>

      {/* ── Modales ── */}
      <NuevaCitaModal
        open={modalNuevaCita}
        onClose={() => setModalNuevaCita(false)}
        onSaved={() => cargarCitas(date, view, filtroFisio)}
        fisioterapeutas={fisioterapeutas}
        initialDateTime={slotSeleccionado}
      />
      <DetalleCitaModal
        citaId={detalleCitaId}
        onClose={() => setDetalleCitaId(null)}
        onUpdated={() => cargarCitas(date, view, filtroFisio)}
      />
    </div>
  )
}
