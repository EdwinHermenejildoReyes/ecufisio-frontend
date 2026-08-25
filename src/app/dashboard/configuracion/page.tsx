'use client'

import { useState, useEffect, useRef } from 'react'
import { Copy, Check, Download, Share2, Code2 } from 'lucide-react'
import { configuracionRepository } from '@/repositories/configuracion'
import { getErrorMessage } from '@/utils/errorMessages'
import { WEB_URL } from '@/utils/getEnvVars'
import { sanitizeTel } from '@/utils/format'

// ─── Types ───────────────────────────────────────────────────────────────────

type Clinica = {
  id?: number
  nombre: string
  ruc: string
  direccion: string
  telefono: string
  email: string
  descripcion: string
}

type Servicio = {
  id: number
  nombre: string
  descripcion: string
  duracion_minutos: number
  precio: string
  color: string
  is_active: boolean
}

type Sala = {
  id: number
  nombre: string
  descripcion: string
  capacidad: number
  is_active: boolean
}

type Miembro = {
  id: number
  nombres: string
  apellidos: string
  nombre_completo: string
  email: string
  telefono: string
  rol: string
  is_active: boolean
}

type Disponibilidad = {
  id: number
  fisioterapeuta: number
  dia_semana: number
  hora_inicio: string
  hora_fin: string
}

const DIAS_SEMANA = [
  { value: 0, label: 'Lunes' },
  { value: 1, label: 'Martes' },
  { value: 2, label: 'Miércoles' },
  { value: 3, label: 'Jueves' },
  { value: 4, label: 'Viernes' },
  { value: 5, label: 'Sábado' },
  { value: 6, label: 'Domingo' },
]

// ─── Constants ───────────────────────────────────────────────────────────────

const TABS = [
  { id: 'clinica', label: 'Clínica' },
  { id: 'servicios', label: 'Servicios' },
  { id: 'salas', label: 'Salas' },
  { id: 'equipo', label: 'Equipo' },
]

const COLORES_PRESET = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#06B6D4', '#EC4899', '#F97316', '#14B8A6', '#6366F1',
  '#84CC16', '#64748B',
]

const ROL_CHOICES = [
  { value: 'admin', label: 'Administrador' },
  { value: 'fisioterapeuta', label: 'Fisioterapeuta' },
  { value: 'recepcionista', label: 'Recepcionista' },
]

const ROL_LABEL: Record<string, string> = {
  admin: 'Administrador',
  fisioterapeuta: 'Fisioterapeuta',
  recepcionista: 'Recepcionista',
}

const ROL_COLOR: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700',
  fisioterapeuta: 'bg-blue-100 text-blue-700',
  recepcionista: 'bg-teal-100 text-teal-700',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function initials(nombres: string, apellidos: string) {
  return `${nombres[0] || ''}${apellidos[0] || ''}`.toUpperCase()
}

function avatarBg(str: string) {
  const colors = ['#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6','#06B6D4','#EC4899']
  let h = 0
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h)
  return colors[Math.abs(h) % colors.length]
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ConfiguracionPage() {
  const [tab, setTab] = useState('clinica')

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="text-sm text-gray-500 mt-0.5">Gestiona la información de la clínica y el equipo</p>
      </div>

      <div className="flex gap-1 border-b border-gray-200">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === t.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'clinica'   && <TabClinica />}
      {tab === 'servicios' && <TabServicios />}
      {tab === 'salas'     && <TabSalas />}
      {tab === 'equipo'    && <TabEquipo />}
    </div>
  )
}

// ─── Tab Clínica ──────────────────────────────────────────────────────────────

function TabClinica() {
  const [form, setForm] = useState<Clinica>({
    nombre: '', ruc: '', direccion: '', telefono: '', email: '', descripcion: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    configuracionRepository.perfil()
      .then((d) => d && setForm(d))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)
    try {
      const d = await configuracionRepository.actualizarPerfil(form)
      setForm(d)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="w-7 h-7 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700">Información general</h2>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Nombre de la clínica" required>
            <input
              className="input"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              required
            />
          </Field>
          <Field label="RUC">
            <input
              className="input"
              value={form.ruc}
              onChange={(e) => setForm({ ...form, ruc: e.target.value })}
              maxLength={13}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Teléfono">
            <input
              className="input"
              type="tel"
              maxLength={15}
              value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: sanitizeTel(e.target.value) })}
            />
          </Field>
          <Field label="Email de contacto">
            <input
              type="email"
              className="input"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </Field>
        </div>

        <Field label="Dirección">
          <input
            className="input"
            value={form.direccion}
            onChange={(e) => setForm({ ...form, direccion: e.target.value })}
          />
        </Field>

        <Field label="Descripción">
          <textarea
            className="input min-h-[80px] resize-none"
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
          />
        </Field>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">Cambios guardados correctamente.</p>}

      <button
        type="submit"
        disabled={saving}
        className="btn-primary disabled:opacity-60"
      >
        {saving ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </form>
  )
}

// ─── Tab Servicios ────────────────────────────────────────────────────────────

function TabServicios() {
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<{ open: boolean; data: Partial<Servicio> | null }>({
    open: false, data: null,
  })
  const [confirmDel, setConfirmDel] = useState<Servicio | null>(null)
  const [error, setError] = useState('')

  const cargar = () =>
    configuracionRepository.listarServicios()
      .then((d) => setServicios(Array.isArray(d) ? d : (d.results ?? [])))
      .catch(() => {})
      .finally(() => setLoading(false))

  useEffect(() => { cargar() }, [])

  const handleSave = async (data: Partial<Servicio>) => {
    setError('')
    try {
      if (data.id) {
        const { id, ...rest } = data
        await configuracionRepository.actualizarServicio(id, rest)
      } else {
        await configuracionRepository.crearServicio(data)
      }
      setModal({ open: false, data: null })
      cargar()
    } catch (err: any) {
      setError(getErrorMessage(err))
    }
  }

  const handleDelete = async (s: Servicio) => {
    try {
      await configuracionRepository.eliminarServicio(s.id)
      setConfirmDel(null)
      cargar()
    } catch {
      setConfirmDel(null)
    }
  }

  if (loading) return <Spinner />

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setModal({ open: true, data: { color: '#3B82F6', duracion_minutos: 60 } })}
          className="btn-primary"
        >
          + Nuevo servicio
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {servicios.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-10">No hay servicios configurados.</p>
        )}
        {servicios.map((s) => (
          <div key={s.id} className="flex items-center gap-4 px-5 py-4">
            <span
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ background: s.color }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{s.nombre}</p>
              <p className="text-xs text-gray-400">
                {s.duracion_minutos} min · ${Number(s.precio).toFixed(2)}
                {s.descripcion && ` · ${s.descripcion}`}
              </p>
            </div>
            {!s.is_active && (
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                Inactivo
              </span>
            )}
            <button
              onClick={() => setModal({ open: true, data: s })}
              className="text-sm text-blue-600 hover:underline"
            >
              Editar
            </button>
            <button
              onClick={() => setConfirmDel(s)}
              className="text-sm text-red-500 hover:underline"
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>

      {modal.open && (
        <ServicioModal
          data={modal.data}
          error={error}
          onSave={handleSave}
          onClose={() => { setModal({ open: false, data: null }); setError('') }}
        />
      )}

      {confirmDel && (
        <ConfirmModal
          message={`¿Eliminar el servicio "${confirmDel.nombre}"?`}
          onConfirm={() => handleDelete(confirmDel)}
          onCancel={() => setConfirmDel(null)}
        />
      )}
    </div>
  )
}

function ServicioModal({
  data, error, onSave, onClose,
}: {
  data: Partial<Servicio> | null
  error: string
  onSave: (d: Partial<Servicio>) => void
  onClose: () => void
}) {
  const [form, setForm] = useState<Partial<Servicio>>({
    nombre: '', descripcion: '', duracion_minutos: 60, precio: '0', color: '#3B82F6', is_active: true,
    ...data,
  })
  const [saving, setSaving] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await onSave(form)
    setSaving(false)
  }

  return (
    <Modal title={form.id ? 'Editar servicio' : 'Nuevo servicio'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Nombre" required>
          <input className="input" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
        </Field>
        <Field label="Descripción">
          <input className="input" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Duración (min)" required>
            <input
              type="number"
              className="input"
              min={5}
              value={form.duracion_minutos}
              onChange={(e) => setForm({ ...form, duracion_minutos: Number(e.target.value) })}
              required
            />
          </Field>
          <Field label="Precio ($)" required>
            <input
              type="number"
              className="input"
              min={0}
              step="0.01"
              value={form.precio}
              onChange={(e) => setForm({ ...form, precio: e.target.value })}
              required
            />
          </Field>
        </div>
        <Field label="Color en el calendario">
          <div className="flex flex-wrap gap-2 mt-1">
            {COLORES_PRESET.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setForm({ ...form, color: c })}
                className={`w-7 h-7 rounded-full border-2 transition-all ${
                  form.color === c ? 'border-gray-900 scale-110' : 'border-transparent'
                }`}
                style={{ background: c }}
              />
            ))}
          </div>
        </Field>
        {form.id && (
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="rounded"
            />
            Servicio activo
          </label>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <ModalFooter onClose={onClose} saving={saving} label={form.id ? 'Guardar' : 'Crear servicio'} />
      </form>
    </Modal>
  )
}

// ─── Tab Salas ────────────────────────────────────────────────────────────────

function TabSalas() {
  const [salas, setSalas] = useState<Sala[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<{ open: boolean; data: Partial<Sala> | null }>({
    open: false, data: null,
  })
  const [confirmDel, setConfirmDel] = useState<Sala | null>(null)
  const [error, setError] = useState('')

  const cargar = () =>
    configuracionRepository.listarSalas()
      .then((d) => setSalas(Array.isArray(d) ? d : (d.results ?? [])))
      .catch(() => {})
      .finally(() => setLoading(false))

  useEffect(() => { cargar() }, [])

  const handleSave = async (data: Partial<Sala>) => {
    setError('')
    try {
      if (data.id) {
        const { id, ...rest } = data
        await configuracionRepository.actualizarSala(id, rest)
      } else {
        await configuracionRepository.crearSala(data)
      }
      setModal({ open: false, data: null })
      cargar()
    } catch (err: any) {
      setError(getErrorMessage(err))
    }
  }

  const handleDelete = async (s: Sala) => {
    try {
      await configuracionRepository.eliminarSala(s.id)
      setConfirmDel(null)
      cargar()
    } catch {
      setConfirmDel(null)
    }
  }

  if (loading) return <Spinner />

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setModal({ open: true, data: { capacidad: 1 } })}
          className="btn-primary"
        >
          + Nueva sala
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {salas.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-10">No hay salas configuradas.</p>
        )}
        {salas.map((s) => (
          <div key={s.id} className="flex items-center gap-4 px-5 py-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{s.nombre}</p>
              <p className="text-xs text-gray-400">
                Capacidad: {s.capacidad} persona{s.capacidad !== 1 ? 's' : ''}
                {s.descripcion && ` · ${s.descripcion}`}
              </p>
            </div>
            {!s.is_active && (
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                Inactiva
              </span>
            )}
            <button
              onClick={() => setModal({ open: true, data: s })}
              className="text-sm text-blue-600 hover:underline"
            >
              Editar
            </button>
            <button
              onClick={() => setConfirmDel(s)}
              className="text-sm text-red-500 hover:underline"
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>

      {modal.open && (
        <SalaModal
          data={modal.data}
          error={error}
          onSave={handleSave}
          onClose={() => { setModal({ open: false, data: null }); setError('') }}
        />
      )}
      {confirmDel && (
        <ConfirmModal
          message={`¿Eliminar la sala "${confirmDel.nombre}"?`}
          onConfirm={() => handleDelete(confirmDel)}
          onCancel={() => setConfirmDel(null)}
        />
      )}
    </div>
  )
}

function SalaModal({
  data, error, onSave, onClose,
}: {
  data: Partial<Sala> | null
  error: string
  onSave: (d: Partial<Sala>) => void
  onClose: () => void
}) {
  const [form, setForm] = useState<Partial<Sala>>({
    nombre: '', descripcion: '', capacidad: 1, is_active: true, ...data,
  })
  const [saving, setSaving] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await onSave(form)
    setSaving(false)
  }

  return (
    <Modal title={form.id ? 'Editar sala' : 'Nueva sala'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Nombre" required>
          <input className="input" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
        </Field>
        <Field label="Descripción">
          <input className="input" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
        </Field>
        <Field label="Capacidad (personas)" required>
          <input
            type="number"
            className="input"
            min={1}
            value={form.capacidad}
            onChange={(e) => setForm({ ...form, capacidad: Number(e.target.value) })}
            required
          />
        </Field>
        {form.id && (
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="rounded"
            />
            Sala activa
          </label>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <ModalFooter onClose={onClose} saving={saving} label={form.id ? 'Guardar' : 'Crear sala'} />
      </form>
    </Modal>
  )
}

// ─── Tab Equipo ───────────────────────────────────────────────────────────────

function TabEquipo() {
  const [equipo, setEquipo] = useState<Miembro[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<{ open: boolean; data: Partial<Miembro> | null }>({
    open: false, data: null,
  })
  const [horariosMiembro, setHorariosMiembro] = useState<Miembro | null>(null)
  const [compartirMiembro, setCompartirMiembro] = useState<Miembro | null>(null)
  const [error, setError] = useState('')

  const cargar = () =>
    configuracionRepository.listarEquipo()
      .then((d) => setEquipo(Array.isArray(d) ? d : (d.results ?? [])))
      .catch(() => {})
      .finally(() => setLoading(false))

  useEffect(() => { cargar() }, [])

  const handleSave = async (data: any) => {
    setError('')
    try {
      if (data.id) {
        const { id, ...rest } = data
        await configuracionRepository.actualizarMiembro(id, rest)
      } else {
        await configuracionRepository.crearMiembro(data)
      }
      setModal({ open: false, data: null })
      cargar()
    } catch (err: any) {
      setError(getErrorMessage(err))
    }
  }

  const toggleActivo = async (m: Miembro) => {
    try {
      if (m.is_active) {
        await configuracionRepository.desactivarMiembro(m.id)
      } else {
        await configuracionRepository.activarMiembro(m.id)
      }
      cargar()
    } catch {}
  }

  if (loading) return <Spinner />

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setModal({ open: true, data: { rol: 'fisioterapeuta' } })}
          className="btn-primary"
        >
          + Nuevo miembro
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {equipo.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-10">No hay miembros del equipo.</p>
        )}
        {equipo.map((m) => (
          <div key={m.id} className="flex items-center gap-4 px-5 py-4">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ background: avatarBg(m.email) }}
            >
              {initials(m.nombres, m.apellidos)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{m.nombre_completo}</p>
              <p className="text-xs text-gray-400">{m.email}{m.telefono && ` · ${m.telefono}`}</p>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROL_COLOR[m.rol] || 'bg-gray-100 text-gray-600'}`}>
              {ROL_LABEL[m.rol] || m.rol}
            </span>
            {!m.is_active && (
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                Inactivo
              </span>
            )}
            {m.rol === 'fisioterapeuta' && m.is_active && (
              <>
                <button
                  onClick={() => setHorariosMiembro(m)}
                  className="text-sm text-sky-600 hover:underline"
                >
                  Horarios
                </button>
                <button
                  onClick={() => setCompartirMiembro(m)}
                  title="Compartir página de reservas"
                  className="flex items-center gap-1 text-sm text-indigo-600 hover:underline"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Compartir
                </button>
              </>
            )}
            <button
              onClick={() => setModal({ open: true, data: m })}
              className="text-sm text-blue-600 hover:underline"
            >
              Editar
            </button>
            <button
              onClick={() => toggleActivo(m)}
              className={`text-sm hover:underline ${m.is_active ? 'text-red-500' : 'text-green-600'}`}
            >
              {m.is_active ? 'Desactivar' : 'Activar'}
            </button>
          </div>
        ))}
      </div>

      {modal.open && (
        <EquipoModal
          data={modal.data}
          error={error}
          onSave={handleSave}
          onClose={() => { setModal({ open: false, data: null }); setError('') }}
        />
      )}

      {horariosMiembro && (
        <HorariosModal
          miembro={horariosMiembro}
          onClose={() => setHorariosMiembro(null)}
        />
      )}

      {compartirMiembro && (
        <CompartirModal
          miembro={compartirMiembro}
          onClose={() => setCompartirMiembro(null)}
        />
      )}
    </div>
  )
}

// ─── Modal Compartir ──────────────────────────────────────────────────────────

function CompartirModal({ miembro, onClose }: { miembro: Miembro; onClose: () => void }) {
  const url = `${WEB_URL}/reservar/${miembro.id}`
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`
  const iframeCode = `<iframe src="${url}" style="width:100%;max-width:480px;height:720px;border:none;border-radius:16px;" loading="lazy"></iframe>`

  const [copiedUrl, setCopiedUrl] = useState(false)
  const [copiedIframe, setCopiedIframe] = useState(false)

  const copy = async (text: string, setCopied: (v: boolean) => void) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadQR = async () => {
    const res = await fetch(qrSrc)
    const blob = await res.blob()
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `qr-reservas-${miembro.nombres.toLowerCase()}.png`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-indigo-600" />
            <h2 className="text-base font-semibold text-gray-900">Comparte tu página</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* URL */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">URL de reservas</p>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={url}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-gray-50 focus:outline-none"
              />
              <button
                onClick={() => copy(url, setCopiedUrl)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  copiedUrl ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {copiedUrl ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedUrl ? 'Copiado' : 'Copiar'}
              </button>
            </div>
          </div>

          {/* QR */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Código QR</p>
            <div className="flex items-center gap-4">
              <img
                src={qrSrc}
                alt="QR de reservas"
                className="w-32 h-32 rounded-xl border border-gray-200"
              />
              <div className="flex-1 space-y-2">
                <p className="text-xs text-gray-500">Tus pacientes pueden escanear este código para acceder directamente a tu página de reservas.</p>
                <button
                  onClick={downloadQR}
                  className="flex items-center gap-2 w-full justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Descargar QR
                </button>
              </div>
            </div>
          </div>

          {/* iFrame */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5" /> Agregar a tu sitio web
            </p>
            <div className="relative">
              <textarea
                readOnly
                value={iframeCode}
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-600 bg-gray-50 resize-none focus:outline-none font-mono"
              />
              <button
                onClick={() => copy(iframeCode, setCopiedIframe)}
                className={`absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                  copiedIframe ? 'bg-emerald-100 text-emerald-700' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {copiedIframe ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copiedIframe ? 'Copiado' : 'Copiar'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function HorariosModal({ miembro, onClose }: { miembro: Miembro; onClose: () => void }) {
  type DiaState = { activo: boolean; hora_inicio: string; hora_fin: string; existingId: number | null }

  const [dias, setDias] = useState<Record<number, DiaState>>(() =>
    Object.fromEntries(DIAS_SEMANA.map((d) => [d.value, { activo: false, hora_inicio: '08:00', hora_fin: '17:00', existingId: null }]))
  )
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    configuracionRepository.listarDisponibilidad(miembro.id)
      .then((data) => {
        const items: Disponibilidad[] = Array.isArray(data) ? data : (data.results ?? [])
        setDias((prev) => {
          const next = { ...prev }
          items.forEach((item) => {
            next[item.dia_semana] = {
              activo: true,
              hora_inicio: item.hora_inicio.slice(0, 5),
              hora_fin: item.hora_fin.slice(0, 5),
              existingId: item.id,
            }
          })
          return next
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [miembro.id])

  const setDia = (dia: number, patch: Partial<DiaState>) =>
    setDias((prev) => ({ ...prev, [dia]: { ...prev[dia], ...patch } }))

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess(false)
    try {
      await Promise.all(
        DIAS_SEMANA.map(async ({ value: dia }) => {
          const d = dias[dia]
          if (d.activo) {
            const payload = {
              fisioterapeuta: miembro.id,
              dia_semana: dia,
              hora_inicio: d.hora_inicio,
              hora_fin: d.hora_fin,
            }
            if (d.existingId) {
              await configuracionRepository.actualizarDisponibilidad(d.existingId, payload)
            } else {
              const created = await configuracionRepository.crearDisponibilidad(payload)
              setDia(dia, { existingId: created.id })
            }
          } else if (d.existingId) {
            await configuracionRepository.eliminarDisponibilidad(d.existingId)
            setDia(dia, { existingId: null })
          }
        })
      )
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Horario de atención</h2>
            <p className="text-xs text-gray-400 mt-0.5">{miembro.nombre_completo}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        <div className="px-6 py-5">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              {DIAS_SEMANA.map(({ value: dia, label }) => {
                const d = dias[dia]
                return (
                  <div key={dia} className={`rounded-xl border p-3 transition-colors ${d.activo ? 'border-sky-200 bg-sky-50' : 'border-gray-100 bg-gray-50'}`}>
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={d.activo}
                        onChange={(e) => setDia(dia, { activo: e.target.checked })}
                        className="w-4 h-4 rounded accent-sky-600"
                      />
                      <span className={`text-sm font-medium w-20 ${d.activo ? 'text-gray-900' : 'text-gray-400'}`}>{label}</span>
                      {d.activo && (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="time"
                            value={d.hora_inicio}
                            onChange={(e) => setDia(dia, { hora_inicio: e.target.value })}
                            className="input text-sm py-1 px-2 flex-1"
                          />
                          <span className="text-gray-400 text-xs">a</span>
                          <input
                            type="time"
                            value={d.hora_fin}
                            onChange={(e) => setDia(dia, { hora_fin: e.target.value })}
                            className="input text-sm py-1 px-2 flex-1"
                          />
                        </div>
                      )}
                      {!d.activo && <span className="text-xs text-gray-400">No trabaja</span>}
                    </label>
                  </div>
                )
              })}
            </div>
          )}

          {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
          {success && <p className="text-sm text-emerald-600 mt-3">✓ Horario guardado correctamente.</p>}

          <div className="flex gap-3 justify-end pt-4 mt-2 border-t border-gray-100">
            <button type="button" onClick={onClose} className="btn-secondary">Cerrar</button>
            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="btn-primary disabled:opacity-60"
            >
              {saving ? 'Guardando...' : 'Guardar horario'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function EquipoModal({
  data, error, onSave, onClose,
}: {
  data: Partial<Miembro> | null
  error: string
  onSave: (d: any) => void
  onClose: () => void
}) {
  const isEdit = Boolean(data?.id)
  const [form, setForm] = useState<any>({
    nombres: '', apellidos: '', email: '', telefono: '', rol: 'fisioterapeuta', password: '',
    ...data,
  })
  const [saving, setSaving] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const payload = isEdit
      ? { id: form.id, nombres: form.nombres, apellidos: form.apellidos, telefono: form.telefono, rol: form.rol }
      : form
    await onSave(payload)
    setSaving(false)
  }

  return (
    <Modal title={isEdit ? 'Editar miembro' : 'Nuevo miembro del equipo'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Nombres" required>
            <input className="input" value={form.nombres} onChange={(e) => setForm({ ...form, nombres: e.target.value })} required />
          </Field>
          <Field label="Apellidos" required>
            <input className="input" value={form.apellidos} onChange={(e) => setForm({ ...form, apellidos: e.target.value })} required />
          </Field>
        </div>
        {!isEdit && (
          <Field label="Email" required>
            <input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </Field>
        )}
        <Field label="Teléfono">
          <input className="input" type="tel" maxLength={15} value={form.telefono} onChange={(e) => setForm({ ...form, telefono: sanitizeTel(e.target.value) })} />
        </Field>
        <Field label="Rol" required>
          <select className="input" value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })}>
            {ROL_CHOICES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </Field>
        {!isEdit && (
          <Field label="Contraseña temporal" required>
            <input
              type="password"
              className="input"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              minLength={8}
              required
            />
            <p className="text-xs text-gray-400 mt-1">Mínimo 8 caracteres. Compártela con el miembro.</p>
          </Field>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <ModalFooter onClose={onClose} saving={saving} label={isEdit ? 'Guardar' : 'Crear cuenta'} />
      </form>
    </Modal>
  )
}

// ─── Shared components ────────────────────────────────────────────────────────

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-gray-600">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

function ModalFooter({ onClose, saving, label }: { onClose: () => void; saving: boolean; label: string }) {
  return (
    <div className="flex gap-3 justify-end pt-2">
      <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
      <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
        {saving ? 'Guardando...' : label}
      </button>
    </div>
  )
}

function ConfirmModal({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
        <p className="text-sm text-gray-700">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="btn-secondary">Cancelar</button>
          <button onClick={onConfirm} className="bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-red-700">
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}

function Spinner() {
  return (
    <div className="flex items-center justify-center h-40">
      <div className="w-7 h-7 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
