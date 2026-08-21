'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronLeft, Save, Loader2, AlertCircle, CheckCircle2,
  User, Calendar, Clock, Activity, Plus, Trash2, ChevronDown, ChevronUp,
} from 'lucide-react'
import { expedienteRepository } from '@/repositories/expediente'

/* ── Tipos ── */
interface EvaluacionPostural {
  id: string
  tipo: 'inicial' | 'seguimiento' | 'alta'
  evaluacion_frontal: Record<string, { hallazgo: string; lado: string }>
  evaluacion_posterior: Record<string, { hallazgo: string; lado: string }>
  evaluacion_lateral: Record<string, { hallazgo: string; lado: string }>
  notas: string
}

interface SesionDetalle {
  id: string
  cita_id: string
  paciente_nombre: string
  paciente_id: string
  fisioterapeuta_nombre: string
  servicio_nombre: string
  fecha_hora: string
  fecha_hora_fin: string
  cita_estado: string
  motivo_consulta: string
  diagnostico_cie10: string
  diagnostico_descripcion: string
  tratamiento_realizado: string
  observaciones: string
  proxima_sesion_recomendada: string
  escala_dolor_inicio: number | null
  escala_dolor_fin: number | null
  evaluaciones: EvaluacionPostural[]
}

/* ── Componentes UI ── */
function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  )
}

const INPUT_CLS = 'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent'
const TEXTAREA_CLS = `${INPUT_CLS} resize-none`

/* ── Escala de dolor ── */
function EscalaDolor({
  value, onChange, label,
}: { value: number | null; onChange: (v: number | null) => void; label: string }) {
  const color = (n: number) =>
    n <= 3 ? 'bg-emerald-500' : n <= 6 ? 'bg-amber-500' : 'bg-red-500'

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex items-center gap-1.5 flex-wrap">
        {Array.from({ length: 11 }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(value === i ? null : i)}
            className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all border-2 ${
              value === i
                ? `${color(i)} text-white border-transparent scale-110`
                : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'
            }`}
          >
            {i}
          </button>
        ))}
        {value !== null && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-xs text-gray-400 hover:text-gray-600 ml-1"
          >
            Borrar
          </button>
        )}
      </div>
      {value !== null && (
        <p className={`text-xs mt-1 font-medium ${
          value <= 3 ? 'text-emerald-600' : value <= 6 ? 'text-amber-600' : 'text-red-600'
        }`}>
          {value === 0 ? 'Sin dolor' : value <= 3 ? 'Leve' : value <= 6 ? 'Moderado' : 'Severo'} ({value}/10)
        </p>
      )}
    </div>
  )
}

/* ── Evaluación postural ── */
const ZONAS_POSTURALES = ['cabeza', 'hombros', 'columna', 'pelvis', 'rodillas', 'tobillos']
const LADOS = ['', 'izquierdo', 'derecho', 'bilateral']
const TIPO_EVAL_LABEL: Record<string, string> = {
  inicial: 'Inicial', seguimiento: 'Seguimiento', alta: 'Alta',
}

type PlanoPostural = 'evaluacion_frontal' | 'evaluacion_posterior' | 'evaluacion_lateral'

interface EvalForm {
  tipo: 'inicial' | 'seguimiento' | 'alta'
  evaluacion_frontal: Record<string, { hallazgo: string; lado: string }>
  evaluacion_posterior: Record<string, { hallazgo: string; lado: string }>
  evaluacion_lateral: Record<string, { hallazgo: string; lado: string }>
  notas: string
}

const EVAL_EMPTY: EvalForm = {
  tipo: 'inicial',
  evaluacion_frontal: {},
  evaluacion_posterior: {},
  evaluacion_lateral: {},
  notas: '',
}

function EvaluacionCard({
  ev, sesionId, onDeleted, onUpdated,
}: {
  ev: EvaluacionPostural
  sesionId: string
  onDeleted: () => void
  onUpdated: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState<EvalForm>({
    tipo: ev.tipo,
    evaluacion_frontal: ev.evaluacion_frontal,
    evaluacion_posterior: ev.evaluacion_posterior,
    evaluacion_lateral: ev.evaluacion_lateral,
    notas: ev.notas,
  })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const setZona = (plano: PlanoPostural, zona: string, campo: 'hallazgo' | 'lado', valor: string) => {
    setForm((f) => ({
      ...f,
      [plano]: {
        ...f[plano],
        [zona]: { ...f[plano][zona], [campo]: valor },
      },
    }))
  }

  const guardar = async () => {
    setSaving(true)
    try {
      await expedienteRepository.actualizarEvaluacion(ev.id, form)
      onUpdated()
      setEditMode(false)
    } finally {
      setSaving(false)
    }
  }

  const eliminar = async () => {
    if (!confirm('¿Eliminar esta evaluación?')) return
    setDeleting(true)
    try {
      await expedienteRepository.eliminarEvaluacion(ev.id)
      onDeleted()
    } finally {
      setDeleting(false)
    }
  }

  const PLANOS: { key: PlanoPostural; label: string }[] = [
    { key: 'evaluacion_frontal', label: 'Frontal' },
    { key: 'evaluacion_posterior', label: 'Posterior' },
    { key: 'evaluacion_lateral', label: 'Lateral' },
  ]

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Cabecera */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            ev.tipo === 'inicial' ? 'bg-sky-100 text-sky-700' :
            ev.tipo === 'seguimiento' ? 'bg-violet-100 text-violet-700' :
            'bg-emerald-100 text-emerald-700'
          }`}>
            {TIPO_EVAL_LABEL[ev.tipo]}
          </span>
          {ev.notas && <span className="text-xs text-gray-500 line-clamp-1">{ev.notas}</span>}
        </div>
        <div className="flex items-center gap-2">
          {!editMode && (
            <button onClick={() => setEditMode(true)}
              className="text-xs text-sky-600 hover:underline">Editar</button>
          )}
          <button onClick={eliminar} disabled={deleting}
            className="text-gray-400 hover:text-red-500 transition-colors p-1">
            {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
          </button>
          <button onClick={() => setExpanded(!expanded)} className="text-gray-400 hover:text-gray-600 p-1">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Contenido expandible */}
      {expanded && (
        <div className="p-4 space-y-4">
          {editMode && (
            <div className="flex items-center gap-3">
              <select value={form.tipo}
                onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value as EvalForm['tipo'] }))}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent">
                <option value="inicial">Inicial</option>
                <option value="seguimiento">Seguimiento</option>
                <option value="alta">Alta</option>
              </select>
            </div>
          )}

          {/* Tabla de zonas por plano */}
          {PLANOS.map(({ key, label }) => (
            <div key={key}>
              <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{label}</h5>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-gray-100 rounded-lg overflow-hidden">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-3 py-2 text-xs text-gray-500 font-medium">Zona</th>
                      <th className="text-left px-3 py-2 text-xs text-gray-500 font-medium">Hallazgo</th>
                      <th className="text-left px-3 py-2 text-xs text-gray-500 font-medium">Lado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {ZONAS_POSTURALES.map((zona) => {
                      const datos = editMode ? form[key][zona] : ev[key][zona]
                      return (
                        <tr key={zona}>
                          <td className="px-3 py-2 text-gray-700 capitalize font-medium">{zona}</td>
                          <td className="px-3 py-2">
                            {editMode
                              ? <input type="text" value={form[key][zona]?.hallazgo ?? ''}
                                  onChange={(e) => setZona(key, zona, 'hallazgo', e.target.value)}
                                  className="w-full border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
                                  placeholder="Hallazgo…" />
                              : <span className="text-gray-600">{datos?.hallazgo || <span className="text-gray-300">—</span>}</span>
                            }
                          </td>
                          <td className="px-3 py-2">
                            {editMode
                              ? <select value={form[key][zona]?.lado ?? ''}
                                  onChange={(e) => setZona(key, zona, 'lado', e.target.value)}
                                  className="border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500">
                                  {LADOS.map((l) => <option key={l} value={l}>{l || 'Sin especificar'}</option>)}
                                </select>
                              : <span className="text-gray-500 capitalize">{datos?.lado || <span className="text-gray-300">—</span>}</span>
                            }
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {/* Notas */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Notas</label>
            {editMode
              ? <textarea value={form.notas} onChange={(e) => setForm((f) => ({ ...f, notas: e.target.value }))}
                  rows={2} className={TEXTAREA_CLS} />
              : <p className="text-sm text-gray-600">{ev.notas || <span className="text-gray-300">Sin notas</span>}</p>
            }
          </div>

          {editMode && (
            <div className="flex gap-2 pt-2">
              <button onClick={() => setEditMode(false)}
                className="border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50">Cancelar</button>
              <button onClick={guardar} disabled={saving}
                className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-70">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Guardar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Formulario de nueva evaluación ── */
function NuevaEvaluacionForm({
  sesionId, onCreada,
}: { sesionId: string; onCreada: () => void }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<EvalForm>(EVAL_EMPTY)
  const [saving, setSaving] = useState(false)

  const setZona = (plano: PlanoPostural, zona: string, campo: 'hallazgo' | 'lado', valor: string) => {
    setForm((f) => ({
      ...f,
      [plano]: { ...f[plano], [zona]: { ...f[plano][zona], [campo]: valor } },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await expedienteRepository.crearEvaluacion({ ...form, sesion: sesionId })
      onCreada()
      setOpen(false)
      setForm(EVAL_EMPTY)
    } finally {
      setSaving(false)
    }
  }

  if (!open) return (
    <button onClick={() => setOpen(true)}
      className="flex items-center gap-2 border border-dashed border-sky-300 text-sky-600 hover:bg-sky-50 px-4 py-3 rounded-xl text-sm font-medium transition-colors w-full justify-center">
      <Plus className="w-4 h-4" />Agregar evaluación postural
    </button>
  )

  const PLANOS: { key: PlanoPostural; label: string }[] = [
    { key: 'evaluacion_frontal', label: 'Frontal' },
    { key: 'evaluacion_posterior', label: 'Posterior' },
    { key: 'evaluacion_lateral', label: 'Lateral' },
  ]

  return (
    <form onSubmit={handleSubmit} className="border border-sky-200 bg-sky-50/30 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-gray-800">Nueva evaluación postural</h4>
        <button type="button" onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
          <ChevronUp className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700">Tipo</label>
        <select value={form.tipo}
          onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value as EvalForm['tipo'] }))}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent">
          <option value="inicial">Inicial</option>
          <option value="seguimiento">Seguimiento</option>
          <option value="alta">Alta</option>
        </select>
      </div>

      {PLANOS.map(({ key, label }) => (
        <div key={key}>
          <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{label}</h5>
          <div className="grid grid-cols-1 gap-2">
            {ZONAS_POSTURALES.map((zona) => (
              <div key={zona} className="grid grid-cols-3 gap-2 items-center">
                <span className="text-sm text-gray-700 capitalize font-medium">{zona}</span>
                <input type="text" value={form[key][zona]?.hallazgo ?? ''}
                  onChange={(e) => setZona(key, zona, 'hallazgo', e.target.value)}
                  placeholder="Hallazgo…"
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent" />
                <select value={form[key][zona]?.lado ?? ''}
                  onChange={(e) => setZona(key, zona, 'lado', e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent">
                  {LADOS.map((l) => <option key={l} value={l}>{l || 'Sin especificar'}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
        <textarea value={form.notas} onChange={(e) => setForm((f) => ({ ...f, notas: e.target.value }))}
          rows={2} placeholder="Observaciones adicionales…"
          className={TEXTAREA_CLS} />
      </div>

      <div className="flex gap-2">
        <button type="button" onClick={() => setOpen(false)}
          className="border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50">
          Cancelar
        </button>
        <button type="submit" disabled={saving}
          className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-70">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Guardar evaluación
        </button>
      </div>
    </form>
  )
}

/* ── Página de detalle ── */
export default function SesionDetallePage() {
  const { id } = useParams<{ id: string }>()
  const [sesion, setSesion] = useState<SesionDetalle | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const [form, setForm] = useState({
    motivo_consulta: '',
    diagnostico_cie10: '',
    diagnostico_descripcion: '',
    tratamiento_realizado: '',
    observaciones: '',
    proxima_sesion_recomendada: '',
    escala_dolor_inicio: null as number | null,
    escala_dolor_fin: null as number | null,
  })

  const cargar = useCallback(() => {
    setLoading(true)
    expedienteRepository.obtenerSesion(id)
      .then((s) => {
        setSesion(s)
        setForm({
          motivo_consulta: s.motivo_consulta,
          diagnostico_cie10: s.diagnostico_cie10,
          diagnostico_descripcion: s.diagnostico_descripcion,
          tratamiento_realizado: s.tratamiento_realizado,
          observaciones: s.observaciones,
          proxima_sesion_recomendada: s.proxima_sesion_recomendada,
          escala_dolor_inicio: s.escala_dolor_inicio,
          escala_dolor_fin: s.escala_dolor_fin,
        })
      })
      .catch(() => setSesion(null))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => { cargar() }, [cargar])

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }))

  const guardar = async () => {
    setSaving(true)
    setSaved(false)
    setSaveError(null)
    try {
      await expedienteRepository.actualizarSesion(id, form)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: any) {
      setSaveError(err?.response?.data?.detail ?? 'No se pudo guardar.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="w-6 h-6 animate-spin text-sky-500" />
    </div>
  )

  if (!sesion) return (
    <div className="flex flex-col items-center justify-center h-full gap-3">
      <AlertCircle className="w-10 h-10 text-red-400" />
      <p className="text-gray-600">Sesión no encontrada.</p>
      <Link href="/dashboard/expediente" className="text-sky-600 hover:underline text-sm">Volver</Link>
    </div>
  )

  return (
    <div className="flex flex-col h-full">
      {/* ── Header ── */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <Link href="/dashboard/expediente"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-3">
          <ChevronLeft className="w-4 h-4" />Expediente
        </Link>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-lg font-bold text-gray-900">{sesion.paciente_nombre}</h1>
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 flex-wrap">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-gray-400" />{sesion.fisioterapeuta_nombre}
              </span>
              <span className="flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-gray-400" />{sesion.servicio_nombre}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                {new Date(sesion.fecha_hora).toLocaleDateString('es-EC', {
                  weekday: 'short', day: 'numeric', month: 'long', year: 'numeric',
                })}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                {new Date(sesion.fecha_hora).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })}
                {' – '}
                {new Date(sesion.fecha_hora_fin).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          {/* Guardar */}
          <div className="flex items-center gap-3">
            {saved && (
              <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
                <CheckCircle2 className="w-4 h-4" />Guardado
              </span>
            )}
            {saveError && (
              <span className="flex items-center gap-1.5 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />{saveError}
              </span>
            )}
            <button
              onClick={guardar}
              disabled={saving}
              className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-70"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Guardar sesión
            </button>
          </div>
        </div>
      </div>

      {/* ── Formulario ── */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-8">

          {/* ── Sección 1: Consulta ── */}
          <section className="space-y-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100 pb-2">
              Consulta
            </h2>

            <Campo label="Motivo de consulta *">
              <textarea value={form.motivo_consulta} onChange={set('motivo_consulta')}
                rows={3} placeholder="Describe el motivo principal de la consulta..."
                className={TEXTAREA_CLS} />
            </Campo>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Campo label="Código CIE-10">
                <input type="text" value={form.diagnostico_cie10} onChange={set('diagnostico_cie10')}
                  placeholder="M54.5" maxLength={10}
                  className={`${INPUT_CLS} font-mono`} />
              </Campo>
              <div className="md:col-span-2">
                <Campo label="Descripción diagnóstica">
                  <input type="text" value={form.diagnostico_descripcion} onChange={set('diagnostico_descripcion')}
                    placeholder="Lumbalgia inespecífica…"
                    className={INPUT_CLS} />
                </Campo>
              </div>
            </div>
          </section>

          {/* ── Sección 2: Escala de dolor ── */}
          <section className="space-y-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100 pb-2">
              Escala de dolor (EVA)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <EscalaDolor
                value={form.escala_dolor_inicio}
                onChange={(v) => setForm((f) => ({ ...f, escala_dolor_inicio: v }))}
                label="Al inicio de la sesión"
              />
              <EscalaDolor
                value={form.escala_dolor_fin}
                onChange={(v) => setForm((f) => ({ ...f, escala_dolor_fin: v }))}
                label="Al finalizar la sesión"
              />
            </div>
            {form.escala_dolor_inicio !== null && form.escala_dolor_fin !== null && (
              <p className={`text-sm font-medium ${
                form.escala_dolor_fin < form.escala_dolor_inicio ? 'text-emerald-600' :
                form.escala_dolor_fin > form.escala_dolor_inicio ? 'text-red-600' : 'text-gray-500'
              }`}>
                {form.escala_dolor_fin < form.escala_dolor_inicio
                  ? `Mejoría: −${form.escala_dolor_inicio - form.escala_dolor_fin} puntos`
                  : form.escala_dolor_fin > form.escala_dolor_inicio
                  ? `Aumento: +${form.escala_dolor_fin - form.escala_dolor_inicio} puntos`
                  : 'Sin cambio en la escala de dolor'}
              </p>
            )}
          </section>

          {/* ── Sección 3: Tratamiento ── */}
          <section className="space-y-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100 pb-2">
              Tratamiento y evolución
            </h2>

            <Campo label="Tratamiento realizado">
              <textarea value={form.tratamiento_realizado} onChange={set('tratamiento_realizado')}
                rows={4} placeholder="Describe las técnicas y procedimientos aplicados..."
                className={TEXTAREA_CLS} />
            </Campo>

            <Campo label="Observaciones">
              <textarea value={form.observaciones} onChange={set('observaciones')}
                rows={3} placeholder="Respuesta del paciente, incidencias, notas clínicas..."
                className={TEXTAREA_CLS} />
            </Campo>

            <Campo label="Recomendación para próxima sesión">
              <textarea value={form.proxima_sesion_recomendada} onChange={set('proxima_sesion_recomendada')}
                rows={2} placeholder="Continuación del tratamiento, ajustes, ejercicios asignados..."
                className={TEXTAREA_CLS} />
            </Campo>
          </section>

          {/* ── Sección 4: Evaluaciones posturales ── */}
          <section className="space-y-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100 pb-2">
              Evaluaciones posturales
            </h2>

            {sesion.evaluaciones.length === 0 && (
              <p className="text-sm text-gray-400">Sin evaluaciones posturales registradas.</p>
            )}

            <div className="space-y-3">
              {sesion.evaluaciones.map((ev) => (
                <EvaluacionCard
                  key={ev.id}
                  ev={ev}
                  sesionId={sesion.id}
                  onDeleted={cargar}
                  onUpdated={cargar}
                />
              ))}
            </div>

            <NuevaEvaluacionForm sesionId={sesion.id} onCreada={cargar} />
          </section>

          {/* Botón guardar inferior */}
          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button
              onClick={guardar}
              disabled={saving}
              className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-70"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Guardar sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
