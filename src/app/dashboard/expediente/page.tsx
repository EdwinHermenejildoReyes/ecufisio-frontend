'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import {
  ClipboardList, Search, Plus, X, ChevronRight, Loader2,
  Calendar, User, Activity, AlertCircle, RefreshCw,
} from 'lucide-react'
import { expedienteRepository } from '@/repositories/expediente'

/* ── Tipos ── */
interface SesionRow {
  id: string
  cita_id: string
  paciente_nombre: string
  fisioterapeuta_nombre: string
  servicio_nombre: string
  fecha_hora: string
  cita_estado: string
  diagnostico_cie10: string
  diagnostico_descripcion: string
  escala_dolor_inicio: number | null
  escala_dolor_fin: number | null
  tiene_evaluacion: boolean
  created_at: string
}

interface CitaDisponible {
  id: string
  paciente_nombre: string
  servicio_nombre: string
  fecha_hora: string
  estado: string
}

/* ── Escala de dolor visual ── */
function DolorBadge({ valor, label }: { valor: number | null; label: string }) {
  if (valor === null) return null
  const color =
    valor <= 3 ? 'bg-emerald-100 text-emerald-700' :
    valor <= 6 ? 'bg-amber-100 text-amber-700' :
                 'bg-red-100 text-red-700'
  return (
    <span className="flex flex-col items-center">
      <span className="text-[10px] text-gray-400">{label}</span>
      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${color}`}>
        {valor}
      </span>
    </span>
  )
}

/* ── Estado de cita badge ── */
const ESTADO_CLS: Record<string, string> = {
  confirmada:  'bg-sky-100 text-sky-700',
  en_curso:    'bg-emerald-100 text-emerald-700',
  completada:  'bg-gray-100 text-gray-600',
  cancelada:   'bg-red-100 text-red-600',
}

/* ── Modal nueva sesión ── */
function NuevaSesionModal({
  open, onClose, onCreada,
}: { open: boolean; onClose: () => void; onCreada: (id: string) => void }) {
  const [citas, setCitas] = useState<CitaDisponible[]>([])
  const [loadingCitas, setLoadingCitas] = useState(false)
  const [q, setQ] = useState('')
  const [citaSeleccionada, setCitaSeleccionada] = useState<string>('')
  const [motivoConsulta, setMotivoConsulta] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!open) return
    setQ(''); setCitaSeleccionada(''); setMotivoConsulta(''); setError(null)
  }, [open])

  useEffect(() => {
    if (!open) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setLoadingCitas(true)
      expedienteRepository.citasDisponibles(q ? { q } : {})
        .then((data) => setCitas(Array.isArray(data) ? data : (data.results ?? [])))
        .catch(() => setCitas([]))
        .finally(() => setLoadingCitas(false))
    }, 300)
  }, [q, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!citaSeleccionada || !motivoConsulta.trim()) {
      setError('Selecciona una cita e ingresa el motivo de consulta.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const sesion = await expedienteRepository.crearSesion({
        cita: citaSeleccionada,
        motivo_consulta: motivoConsulta,
      })
      onCreada(sesion.id)
      onClose()
    } catch (err: any) {
      const d = err?.response?.data
      if (d?.cita) setError(Array.isArray(d.cita) ? d.cita[0] : d.cita)
      else if (d?.detail) setError(d.detail)
      else setError('No se pudo crear la sesión.')
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Nueva sesión clínica</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              <AlertCircle className="w-4 h-4 shrink-0" />{error}
            </div>
          )}

          {/* Búsqueda de cita */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cita <span className="text-red-400">*</span>
            </label>
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar por nombre de paciente…"
                className="pl-9 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>
            {loadingCitas
              ? <div className="text-center py-3"><Loader2 className="w-4 h-4 animate-spin text-sky-500 mx-auto" /></div>
              : (
              <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-50">
                {citas.length === 0
                  ? <p className="text-sm text-gray-400 text-center py-4">Sin citas disponibles</p>
                  : citas.map((c) => (
                    <label key={c.id}
                      className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors ${citaSeleccionada === c.id ? 'bg-sky-50' : ''}`}>
                      <input type="radio" name="cita" value={c.id}
                        checked={citaSeleccionada === c.id}
                        onChange={() => setCitaSeleccionada(c.id)}
                        className="text-sky-600" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{c.paciente_nombre}</p>
                        <p className="text-xs text-gray-500">
                          {c.servicio_nombre} ·{' '}
                          {new Date(c.fecha_hora).toLocaleDateString('es-EC', { day: 'numeric', month: 'short' })}{' '}
                          {new Date(c.fecha_hora).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ESTADO_CLS[c.estado] ?? 'bg-gray-100 text-gray-600'}`}>
                        {c.estado}
                      </span>
                    </label>
                  ))
                }
              </div>
            )}
          </div>

          {/* Motivo de consulta inicial */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Motivo de consulta <span className="text-red-400">*</span>
            </label>
            <textarea
              value={motivoConsulta}
              onChange={(e) => setMotivoConsulta(e.target.value)}
              rows={3}
              placeholder="Describe el motivo principal de la consulta…"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-70">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Creando…</> : 'Crear sesión'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Página ── */
export default function ExpedientePage() {
  const [sesiones, setSesiones] = useState<SesionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [modalNueva, setModalNueva] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cargar = useCallback(async (busqueda: string) => {
    setLoading(true)
    try {
      const params: Record<string, string> = {}
      if (busqueda) params.q = busqueda
      const data = await expedienteRepository.listarSesiones(params)
      setSesiones(Array.isArray(data) ? data : (data.results ?? []))
    } catch {
      setSesiones([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => cargar(q), 300)
  }, [q, cargar])

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <ClipboardList className="w-5 h-5 text-gray-400" />
            <h1 className="text-lg font-semibold text-gray-900">Expediente clínico</h1>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Paciente o diagnóstico…"
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-60 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
              {q && (
                <button onClick={() => setQ('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button onClick={() => cargar(q)} disabled={loading}
              className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              title="Actualizar">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={() => setModalNueva(true)}
              className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
              <Plus className="w-4 h-4" />Nueva sesión
            </button>
          </div>
        </div>
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-auto p-6">
        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-sky-500" />
          </div>
        )}

        {!loading && sesiones.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <ClipboardList className="w-12 h-12 mb-3 opacity-30" />
            <p className="font-medium text-gray-500">
              {q ? 'Sin resultados para esa búsqueda' : 'Aún no hay sesiones registradas'}
            </p>
            {!q && (
              <button onClick={() => setModalNueva(true)}
                className="mt-4 flex items-center gap-1.5 text-sky-600 hover:underline text-sm font-medium">
                <Plus className="w-4 h-4" />Registrar primera sesión
              </button>
            )}
          </div>
        )}

        {!loading && sesiones.length > 0 && (
          <div className="space-y-2">
            {sesiones.map((s) => (
              <Link
                key={s.id}
                href={`/dashboard/expediente/${s.id}`}
                className="flex items-center gap-4 bg-white rounded-xl border border-gray-100 px-5 py-4 hover:border-gray-200 hover:shadow-sm transition-all group"
              >
                {/* Indicador de evaluación */}
                <div className={`w-2 h-10 rounded-full shrink-0 ${s.tiene_evaluacion ? 'bg-sky-400' : 'bg-gray-200'}`} />

                {/* Info principal */}
                <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{s.paciente_nombre}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <User className="w-3 h-3" />{s.fisioterapeuta_nombre}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-700">{s.servicio_nombre}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      {new Date(s.fecha_hora).toLocaleDateString('es-EC', {
                        weekday: 'short', day: 'numeric', month: 'short',
                      })}
                    </p>
                  </div>
                  <div className="hidden lg:block">
                    {s.diagnostico_cie10 && (
                      <span className="text-xs font-mono bg-violet-50 text-violet-700 px-2 py-0.5 rounded">
                        {s.diagnostico_cie10}
                      </span>
                    )}
                    <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                      {s.diagnostico_descripcion || <span className="text-gray-300">Sin diagnóstico</span>}
                    </p>
                  </div>
                  <div className="hidden lg:flex items-center gap-3">
                    <DolorBadge valor={s.escala_dolor_inicio} label="inicio" />
                    {s.escala_dolor_inicio !== null && s.escala_dolor_fin !== null && (
                      <span className="text-gray-300 text-sm">→</span>
                    )}
                    <DolorBadge valor={s.escala_dolor_fin} label="fin" />
                  </div>
                </div>

                {/* Badges + flecha */}
                <div className="flex items-center gap-2 shrink-0">
                  {s.tiene_evaluacion && (
                    <span className="hidden sm:inline-flex items-center gap-1 text-xs bg-sky-50 text-sky-600 px-2 py-0.5 rounded-full font-medium">
                      <Activity className="w-3 h-3" />Postural
                    </span>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ESTADO_CLS[s.cita_estado] ?? 'bg-gray-100 text-gray-600'}`}>
                    {s.cita_estado}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <NuevaSesionModal
        open={modalNueva}
        onClose={() => setModalNueva(false)}
        onCreada={(id) => { window.location.href = `/dashboard/expediente/${id}` }}
      />
    </div>
  )
}
