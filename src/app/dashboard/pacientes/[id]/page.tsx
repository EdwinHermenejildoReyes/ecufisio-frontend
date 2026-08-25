'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronLeft, User, Phone, Mail, MapPin, AlertCircle, Heart,
  Loader2, Calendar, ClipboardList, Package, Edit3, Save,
  X, CheckCircle2, XCircle, Clock,
} from 'lucide-react'
import { pacientesRepository } from '@/repositories/pacientes'
import { sanitizeCedula, validateCedula } from '@/utils/format'

/* ── Tipos ── */
interface PacienteDetalle {
  id: string
  user: { id: string; email: string; nombres: string; apellidos: string; telefono: string; foto: string | null }
  nombre_completo: string
  edad: number | null
  cedula: string
  fecha_nacimiento: string | null
  sexo: string
  ocupacion: string
  direccion: string
  contacto_emergencia_nombre: string
  contacto_emergencia_telefono: string
  antecedentes_medicos: string
  alergias: string
  medicacion_actual: string
  notas: string
  total_citas: number
  paquetes: PaqueteRow[]
  is_active: boolean
  created_at: string
}

interface CitaRow {
  id: string
  servicio_nombre: string
  servicio_color: string
  fisioterapeuta_nombre: string
  sala_nombre: string | null
  fecha_hora: string
  fecha_hora_fin: string
  duracion_minutos: number
  estado: string
}

interface PaqueteRow {
  id: string
  servicio_nombre: string
  total_sesiones: number
  sesiones_usadas: number
  sesiones_disponibles: number
  precio_total: string
  estado: string
  fecha_vence: string | null
  notas: string
}

/* ── Helpers ── */
const SEXO_LABEL: Record<string, string> = { M: 'Masculino', F: 'Femenino', O: 'Otro' }

const SEXO_CHOICES = [
  { value: '', label: 'Prefiero no indicar' },
  { value: 'M', label: 'Masculino' },
  { value: 'F', label: 'Femenino' },
  { value: 'O', label: 'Otro' },
]

const ESTADO_CITA: Record<string, { label: string; cls: string }> = {
  pendiente:  { label: 'Pendiente',  cls: 'bg-amber-100 text-amber-700' },
  confirmada: { label: 'Confirmada', cls: 'bg-sky-100 text-sky-700' },
  en_curso:   { label: 'En curso',   cls: 'bg-emerald-100 text-emerald-700' },
  completada: { label: 'Completada', cls: 'bg-gray-100 text-gray-600' },
  cancelada:  { label: 'Cancelada',  cls: 'bg-red-100 text-red-600' },
  no_asistio: { label: 'No asistió', cls: 'bg-red-100 text-red-600' },
}

const ESTADO_PAQUETE: Record<string, { label: string; cls: string }> = {
  activo:    { label: 'Activo',    cls: 'bg-emerald-100 text-emerald-700' },
  agotado:   { label: 'Agotado',   cls: 'bg-amber-100 text-amber-700' },
  vencido:   { label: 'Vencido',   cls: 'bg-red-100 text-red-600' },
  cancelado: { label: 'Cancelado', cls: 'bg-gray-100 text-gray-500' },
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div className="flex gap-3">
      <Icon className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm text-gray-800">{value}</p>
      </div>
    </div>
  )
}

/* ── Tab: Perfil ── */
function TabPerfil({ p, onUpdated }: { p: PacienteDetalle; onUpdated: () => void }) {
  const [editando, setEditando] = useState(false)
  const [form, setForm] = useState({
    nombres: p.user.nombres,
    apellidos: p.user.apellidos,
    telefono: p.user.telefono,
    cedula: p.cedula || '',
    fecha_nacimiento: p.fecha_nacimiento || '',
    sexo: p.sexo || '',
    ocupacion: p.ocupacion,
    direccion: p.direccion,
    contacto_emergencia_nombre: p.contacto_emergencia_nombre,
    contacto_emergencia_telefono: p.contacto_emergencia_telefono,
    antecedentes_medicos: p.antecedentes_medicos,
    alergias: p.alergias,
    medicacion_actual: p.medicacion_actual,
    notas: p.notas,
  })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const cedulaError =
    form.cedula.length > 0 && form.cedula.length < 10
      ? 'Debe tener 10 dígitos'
      : form.cedula.length === 10 && !validateCedula(form.cedula)
      ? 'Cédula inválida — verifica el número'
      : ''

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }))

  const guardar = async () => {
    if (cedulaError) { setSaveError(cedulaError); return }
    setSaving(true)
    setSaveError('')
    try {
      await pacientesRepository.actualizar(p.id, form)
      onUpdated()
      setEditando(false)
    } catch {
      setSaveError('Error al guardar. Intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Cabecera de sección */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Información clínica</h3>
        {!editando ? (
          <button onClick={() => setEditando(true)}
            className="flex items-center gap-1.5 text-sm text-sky-600 hover:underline font-medium">
            <Edit3 className="w-3.5 h-3.5" />Editar
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => setEditando(false)} disabled={saving}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
              <X className="w-3.5 h-3.5" />Cancelar
            </button>
            <button onClick={guardar} disabled={saving}
              className="flex items-center gap-1.5 text-sm text-emerald-600 hover:underline font-medium">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Guardar
            </button>
          </div>
        )}
      </div>

      {!editando ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Datos personales */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Datos personales</h4>
            <InfoRow icon={User} label="Cédula" value={p.cedula || 'No registrada'} />
            <InfoRow icon={Calendar} label="Fecha de nacimiento"
              value={p.fecha_nacimiento
                ? `${new Date(p.fecha_nacimiento + 'T00:00:00').toLocaleDateString('es-EC', { day: 'numeric', month: 'long', year: 'numeric' })}${p.edad ? ` (${p.edad} años)` : ''}`
                : 'No registrada'} />
            <InfoRow icon={User} label="Sexo" value={p.sexo ? SEXO_LABEL[p.sexo] : 'No especificado'} />
            <InfoRow icon={ClipboardList} label="Ocupación" value={p.ocupacion || 'No registrada'} />
            <InfoRow icon={MapPin} label="Dirección" value={p.direccion || 'No registrada'} />
          </div>

          {/* Emergencia + clínico */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Contacto de emergencia</h4>
            <InfoRow icon={User} label="Nombre" value={p.contacto_emergencia_nombre || 'No registrado'} />
            <InfoRow icon={Phone} label="Teléfono" value={p.contacto_emergencia_telefono || 'No registrado'} />

            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-2">Historial médico</h4>
            <InfoRow icon={Heart} label="Antecedentes médicos" value={p.antecedentes_medicos || 'Ninguno'} />
            <InfoRow icon={AlertCircle} label="Alergias" value={p.alergias || 'Ninguna'} />
            <InfoRow icon={ClipboardList} label="Medicación actual" value={p.medicacion_actual || 'Ninguna'} />
            {p.notas && <InfoRow icon={ClipboardList} label="Notas internas" value={p.notas} />}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <p className="md:col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wide pt-1">Datos de contacto</p>
          {[
            { k: 'nombres', label: 'Nombres' },
            { k: 'apellidos', label: 'Apellidos' },
            { k: 'telefono', label: 'Teléfono / WhatsApp' },
            { k: 'ocupacion', label: 'Ocupación' },
            { k: 'direccion', label: 'Dirección' },
            { k: 'contacto_emergencia_nombre', label: 'Contacto emergencia — nombre' },
            { k: 'contacto_emergencia_telefono', label: 'Contacto emergencia — teléfono' },
          ].map(({ k, label }) => (
            <div key={k}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input type="text" value={(form as any)[k]} onChange={set(k as any)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent" />
            </div>
          ))}

          <p className="md:col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wide pt-2">Datos personales</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cédula</label>
            <input
              type="text" inputMode="numeric" maxLength={10}
              value={form.cedula}
              onChange={(e) => setForm((f) => ({ ...f, cedula: sanitizeCedula(e.target.value) }))}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-transparent ${
                cedulaError ? 'border-red-300 focus:ring-red-300'
                : form.cedula.length === 10 ? 'border-emerald-300 focus:ring-emerald-300'
                : 'border-gray-200 focus:ring-sky-500'
              }`}
            />
            {cedulaError && <p className="text-xs text-red-500 mt-1">{cedulaError}</p>}
            {form.cedula.length === 10 && !cedulaError && <p className="text-xs text-emerald-600 mt-1">✓ Cédula válida</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de nacimiento</label>
            <input type="date" value={form.fecha_nacimiento} onChange={set('fecha_nacimiento')}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sexo</label>
            <select value={form.sexo} onChange={set('sexo')}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white">
              {SEXO_CHOICES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <p className="md:col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wide pt-2">Historial médico</p>
          {[
            { k: 'antecedentes_medicos', label: 'Antecedentes médicos' },
            { k: 'alergias', label: 'Alergias' },
            { k: 'medicacion_actual', label: 'Medicación actual' },
            { k: 'notas', label: 'Notas internas' },
          ].map(({ k, label }) => (
            <div key={k} className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <textarea value={(form as any)[k]} onChange={set(k as any)} rows={2}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none" />
            </div>
          ))}
          {saveError && <p className="md:col-span-2 text-sm text-red-600">{saveError}</p>}
          <div className="md:col-span-2 flex gap-3 pt-2">
            <button onClick={guardar} disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-60">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Guardar cambios
            </button>
            <button onClick={() => setEditando(false)} disabled={saving}
              className="px-4 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Tab: Historial citas ── */
function TabCitas({ pacienteId }: { pacienteId: string }) {
  const [citas, setCitas] = useState<CitaRow[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    pacientesRepository.historialCitas(pacienteId, { limit: 50 })
      .then((r) => { setCitas(r.results ?? r); setTotal(r.count ?? (r.results ?? r).length) })
      .catch(() => setCitas([]))
      .finally(() => setLoading(false))
  }, [pacienteId])

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-sky-500" /></div>

  if (citas.length === 0) return (
    <div className="text-center py-10 text-gray-400">
      <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
      <p>Sin citas registradas</p>
    </div>
  )

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">{total} cita{total !== 1 ? 's' : ''} en total</p>
      <div className="space-y-2">
        {citas.map((c) => {
          const estado = ESTADO_CITA[c.estado] ?? { label: c.estado, cls: 'bg-gray-100 text-gray-600' }
          return (
            <div key={c.id} className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
              <div className="w-2.5 h-2.5 rounded-full shrink-0 mt-1.5" style={{ backgroundColor: c.servicio_color ?? '#3B82F6' }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-gray-900 text-sm">{c.servicio_nombre}</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${estado.cls}`}>
                    {estado.label}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(c.fecha_hora).toLocaleDateString('es-EC', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(c.fecha_hora).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })}
                    {' – '}{new Date(c.fecha_hora_fin).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />{c.fisioterapeuta_nombre}
                  </span>
                </div>
              </div>
              <Link href={`/dashboard/agenda`}
                className="text-sky-500 hover:text-sky-700 text-xs font-medium shrink-0 mt-1">
                Ver
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── Tab: Paquetes ── */
function TabPaquetes({ pacienteId }: { pacienteId: string }) {
  const [paquetes, setPaquetes] = useState<PaqueteRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    pacientesRepository.paquetes(pacienteId)
      .then(setPaquetes)
      .catch(() => setPaquetes([]))
      .finally(() => setLoading(false))
  }, [pacienteId])

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-sky-500" /></div>

  if (paquetes.length === 0) return (
    <div className="text-center py-10 text-gray-400">
      <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
      <p>Sin paquetes de sesiones</p>
    </div>
  )

  return (
    <div className="space-y-3">
      {paquetes.map((pk) => {
        const estado = ESTADO_PAQUETE[pk.estado] ?? { label: pk.estado, cls: 'bg-gray-100 text-gray-600' }
        const pct = pk.total_sesiones > 0 ? Math.round((pk.sesiones_usadas / pk.total_sesiones) * 100) : 0
        return (
          <div key={pk.id} className="p-4 rounded-xl border border-gray-100 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium text-gray-900">{pk.servicio_nombre}</p>
                <p className="text-sm text-gray-500">
                  {pk.sesiones_usadas} de {pk.total_sesiones} sesiones usadas
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${estado.cls}`}>
                  {estado.label}
                </span>
                <p className="text-sm font-semibold text-gray-800 mt-1">${Number(pk.precio_total).toFixed(2)}</p>
              </div>
            </div>

            {/* Barra de progreso */}
            <div className="space-y-1">
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-500 rounded-full transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>{pk.sesiones_disponibles} disponibles</span>
                {pk.fecha_vence && (
                  <span>Vence: {new Date(pk.fecha_vence + 'T00:00:00').toLocaleDateString('es-EC', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ── Página principal ── */
type Tab = 'perfil' | 'citas' | 'paquetes'

export default function PacienteDetallePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [paciente, setPaciente] = useState<PacienteDetalle | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('perfil')
  const [toggling, setToggling] = useState(false)

  const cargar = () => {
    setLoading(true)
    pacientesRepository.obtener(id)
      .then(setPaciente)
      .catch(() => setPaciente(null))
      .finally(() => setLoading(false))
  }

  useEffect(() => { cargar() }, [id])

  const toggleEstado = async () => {
    if (!paciente) return
    setToggling(true)
    try {
      if (paciente.is_active) await pacientesRepository.desactivar(id)
      else await pacientesRepository.activar(id)
      cargar()
    } finally {
      setToggling(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="w-6 h-6 animate-spin text-sky-500" />
    </div>
  )

  if (!paciente) return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <AlertCircle className="w-10 h-10 text-red-400" />
      <p className="text-gray-600">No se encontró el paciente.</p>
      <Link href="/dashboard/pacientes" className="text-sky-600 hover:underline text-sm">Volver a la lista</Link>
    </div>
  )

  const iniciales = `${paciente.user.nombres[0] ?? ''}${paciente.user.apellidos[0] ?? ''}`.toUpperCase()

  const TABS: { id: Tab; label: string; icon: any }[] = [
    { id: 'perfil',   label: 'Perfil',          icon: User },
    { id: 'citas',    label: `Citas (${paciente.total_citas})`, icon: Calendar },
    { id: 'paquetes', label: 'Paquetes',         icon: Package },
  ]

  return (
    <div className="flex flex-col h-full">
      {/* ── Header ── */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <Link href="/dashboard/pacientes"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ChevronLeft className="w-4 h-4" />Pacientes
        </Link>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-14 h-14 rounded-2xl bg-sky-100 flex items-center justify-center shrink-0">
              <span className="text-sky-700 text-xl font-bold">{iniciales}</span>
            </div>

            {/* Datos básicos */}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900">{paciente.nombre_completo}</h1>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  paciente.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {paciente.is_active ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 flex-wrap">
                {paciente.cedula && (
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    CI: {paciente.cedula}
                  </span>
                )}
                {paciente.user.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />{paciente.user.email}
                  </span>
                )}
                {paciente.user.telefono && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />{paciente.user.telefono}
                  </span>
                )}
                {paciente.edad && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />{paciente.edad} años
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleEstado}
              disabled={toggling}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                paciente.is_active
                  ? 'border border-red-200 text-red-600 hover:bg-red-50'
                  : 'border border-emerald-200 text-emerald-600 hover:bg-emerald-50'
              } disabled:opacity-50`}
            >
              {toggling ? <Loader2 className="w-4 h-4 animate-spin" /> :
                paciente.is_active ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
              {paciente.is_active ? 'Desactivar' : 'Activar'}
            </button>

            <Link href={`/dashboard/agenda`}
              className="flex items-center gap-1.5 px-3 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-semibold transition-colors">
              <Calendar className="w-4 h-4" />
              Nueva cita
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-5 border-b border-gray-100 -mb-px">
          {TABS.map(({ id: tid, label, icon: Icon }) => (
            <button
              key={tid}
              onClick={() => setTab(tid)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                tab === tid
                  ? 'border-sky-600 text-sky-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Contenido del tab ── */}
      <div className="flex-1 overflow-auto p-6">
        {tab === 'perfil' && <TabPerfil p={paciente} onUpdated={cargar} />}
        {tab === 'citas' && <TabCitas pacienteId={id} />}
        {tab === 'paquetes' && <TabPaquetes pacienteId={id} />}
      </div>
    </div>
  )
}
