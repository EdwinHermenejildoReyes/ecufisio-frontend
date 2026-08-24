'use client'

import { useState, useEffect, useRef } from 'react'
import { ejerciciosRepository } from '@/repositories/ejercicios'
import { getErrorMessage } from '@/utils/errorMessages'

// ─── Types ────────────────────────────────────────────────────────────────────

type Grupo = { id: number; nombre: string; descripcion: string; ejercicios_count: number }

type Ejercicio = {
  id: number
  nombre: string
  categoria: string
  grupo_muscular: number | null
  grupo_muscular_nombre: string | null
  descripcion: string
  instrucciones?: string
  video_url: string
  is_active: boolean
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'biblioteca', label: 'Biblioteca' },
  { id: 'grupos', label: 'Grupos musculares' },
]

const CATEGORIAS = [
  { value: '', label: 'Todas' },
  { value: 'fuerza', label: 'Fuerza' },
  { value: 'flexibilidad', label: 'Flexibilidad' },
  { value: 'equilibrio', label: 'Equilibrio' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'funcional', label: 'Funcional' },
]

const CAT_COLOR: Record<string, string> = {
  fuerza:       'bg-red-100 text-red-700',
  flexibilidad: 'bg-green-100 text-green-700',
  equilibrio:   'bg-blue-100 text-blue-700',
  cardio:       'bg-orange-100 text-orange-700',
  funcional:    'bg-purple-100 text-purple-700',
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EjerciciosPage() {
  const [tab, setTab] = useState('biblioteca')

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ejercicios</h1>
        <p className="text-sm text-gray-500 mt-0.5">Biblioteca de ejercicios terapéuticos</p>
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

      {tab === 'biblioteca' && <TabBiblioteca />}
      {tab === 'grupos'     && <TabGrupos />}
    </div>
  )
}

// ─── Tab Biblioteca ───────────────────────────────────────────────────────────

function TabBiblioteca() {
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([])
  const [grupos, setGrupos] = useState<Grupo[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [categoria, setCategoria] = useState('')
  const [grupoFiltro, setGrupoFiltro] = useState('')
  const [modal, setModal] = useState<{ open: boolean; data: Partial<Ejercicio> | null }>({ open: false, data: null })
  const [detalle, setDetalle] = useState<Ejercicio | null>(null)
  const [confirmDel, setConfirmDel] = useState<Ejercicio | null>(null)
  const [error, setError] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const cargar = (params = {}) =>
    ejerciciosRepository.listar(params)
      .then(setEjercicios)
      .catch(() => {})
      .finally(() => setLoading(false))

  useEffect(() => {
    ejerciciosRepository.listarGrupos().then(setGrupos).catch(() => {})
    cargar()
  }, [])

  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setLoading(true)
      cargar({ q, categoria: categoria || undefined, grupo_muscular: grupoFiltro || undefined })
    }, 300)
  }, [q, categoria, grupoFiltro])

  const handleSave = async (data: Partial<Ejercicio>) => {
    setError('')
    try {
      if (data.id) {
        const { id, ...rest } = data
        await ejerciciosRepository.actualizar(id, rest)
      } else {
        await ejerciciosRepository.crear(data)
      }
      setModal({ open: false, data: null })
      cargar({ q, categoria: categoria || undefined, grupo_muscular: grupoFiltro || undefined })
    } catch (err: any) {
      setError(getErrorMessage(err))
    }
  }

  const handleDelete = async (e: Ejercicio) => {
    try {
      await ejerciciosRepository.eliminar(e.id)
      setConfirmDel(null)
      cargar({ q, categoria: categoria || undefined, grupo_muscular: grupoFiltro || undefined })
    } catch {
      setConfirmDel(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Buscar ejercicio..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="input w-56"
        />
        <select
          value={grupoFiltro}
          onChange={(e) => setGrupoFiltro(e.target.value)}
          className="input w-44"
        >
          <option value="">Todos los grupos</option>
          {grupos.map((g) => (
            <option key={g.id} value={g.id}>{g.nombre}</option>
          ))}
        </select>
        <div className="flex gap-1 flex-wrap">
          {CATEGORIAS.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategoria(c.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                categoria === c.value
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="ml-auto">
          <button
            onClick={() => setModal({ open: true, data: { categoria: 'funcional', is_active: true } })}
            className="btn-primary"
          >
            + Nuevo ejercicio
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-7 h-7 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : ejercicios.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          No se encontraron ejercicios.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {ejercicios.map((e) => (
            <EjercicioCard
              key={e.id}
              ejercicio={e}
              onVer={() => setDetalle(e)}
              onEditar={() => setModal({ open: true, data: e })}
              onEliminar={() => setConfirmDel(e)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {modal.open && (
        <EjercicioModal
          data={modal.data}
          grupos={grupos}
          error={error}
          onSave={handleSave}
          onClose={() => { setModal({ open: false, data: null }); setError('') }}
        />
      )}

      {detalle && (
        <EjercicioDetalleModal
          ejercicio={detalle}
          onEditar={() => { setModal({ open: true, data: detalle }); setDetalle(null) }}
          onClose={() => setDetalle(null)}
        />
      )}

      {confirmDel && (
        <ConfirmModal
          message={`¿Eliminar "${confirmDel.nombre}" de la biblioteca?`}
          onConfirm={() => handleDelete(confirmDel)}
          onCancel={() => setConfirmDel(null)}
        />
      )}
    </div>
  )
}

function EjercicioCard({
  ejercicio, onVer, onEditar, onEliminar,
}: {
  ejercicio: Ejercicio
  onVer: () => void
  onEditar: () => void
  onEliminar: () => void
}) {
  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-3 hover:shadow-sm transition-shadow ${
        !ejercicio.is_active ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-gray-900 leading-snug flex-1">{ejercicio.nombre}</p>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${CAT_COLOR[ejercicio.categoria] || 'bg-gray-100 text-gray-600'}`}>
          {CATEGORIAS.find((c) => c.value === ejercicio.categoria)?.label || ejercicio.categoria}
        </span>
      </div>

      {ejercicio.grupo_muscular_nombre && (
        <p className="text-xs text-gray-400">💪 {ejercicio.grupo_muscular_nombre}</p>
      )}

      <p className="text-xs text-gray-500 line-clamp-2 flex-1">{ejercicio.descripcion}</p>

      {ejercicio.video_url && (
        <a
          href={ejercicio.video_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-500 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          ▶ Ver video
        </a>
      )}

      <div className="flex gap-2 pt-1 border-t border-gray-100">
        <button onClick={onVer} className="text-xs text-gray-500 hover:text-gray-700">
          Ver
        </button>
        <button onClick={onEditar} className="text-xs text-blue-600 hover:underline">
          Editar
        </button>
        <button onClick={onEliminar} className="text-xs text-red-500 hover:underline ml-auto">
          Eliminar
        </button>
      </div>
    </div>
  )
}

function EjercicioDetalleModal({
  ejercicio, onEditar, onClose,
}: {
  ejercicio: Ejercicio
  onEditar: () => void
  onClose: () => void
}) {
  const [full, setFull] = useState<Ejercicio | null>(null)

  useEffect(() => {
    ejerciciosRepository.obtener(ejercicio.id).then(setFull).catch(() => setFull(ejercicio))
  }, [ejercicio.id])

  const data = full || ejercicio

  return (
    <Modal title={data.nombre} onClose={onClose} wide>
      <div className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CAT_COLOR[data.categoria] || 'bg-gray-100 text-gray-600'}`}>
            {CATEGORIAS.find((c) => c.value === data.categoria)?.label || data.categoria}
          </span>
          {data.grupo_muscular_nombre && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
              {data.grupo_muscular_nombre}
            </span>
          )}
          {!data.is_active && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Inactivo</span>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Descripción</p>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{data.descripcion}</p>
        </div>

        {data.instrucciones && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Instrucciones</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{data.instrucciones}</p>
          </div>
        )}

        {data.video_url && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Video</p>
            <a
              href={data.video_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline break-all"
            >
              {data.video_url}
            </a>
          </div>
        )}

        <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
          <button onClick={onClose} className="btn-secondary">Cerrar</button>
          <button onClick={onEditar} className="btn-primary">Editar</button>
        </div>
      </div>
    </Modal>
  )
}

function EjercicioModal({
  data, grupos, error, onSave, onClose,
}: {
  data: Partial<Ejercicio> | null
  grupos: Grupo[]
  error: string
  onSave: (d: Partial<Ejercicio>) => void
  onClose: () => void
}) {
  const [form, setForm] = useState<Partial<Ejercicio>>({
    nombre: '',
    descripcion: '',
    instrucciones: '',
    categoria: 'funcional',
    grupo_muscular: null,
    video_url: '',
    is_active: true,
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
    <Modal title={form.id ? 'Editar ejercicio' : 'Nuevo ejercicio'} onClose={onClose} wide>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Nombre" required>
          <input
            className="input"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            required
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Categoría" required>
            <select
              className="input"
              value={form.categoria}
              onChange={(e) => setForm({ ...form, categoria: e.target.value })}
            >
              {CATEGORIAS.filter((c) => c.value).map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Grupo muscular">
            <select
              className="input"
              value={form.grupo_muscular ?? ''}
              onChange={(e) => setForm({ ...form, grupo_muscular: e.target.value ? Number(e.target.value) : null })}
            >
              <option value="">Sin grupo</option>
              {grupos.map((g) => (
                <option key={g.id} value={g.id}>{g.nombre}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Descripción" required>
          <textarea
            className="input min-h-[80px] resize-none"
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            required
          />
        </Field>

        <Field label="Instrucciones">
          <textarea
            className="input min-h-[80px] resize-none"
            value={form.instrucciones}
            onChange={(e) => setForm({ ...form, instrucciones: e.target.value })}
            placeholder="Paso a paso para realizar el ejercicio..."
          />
        </Field>

        <Field label="URL de video (YouTube u otro)">
          <input
            type="url"
            className="input"
            value={form.video_url}
            onChange={(e) => setForm({ ...form, video_url: e.target.value })}
            placeholder="https://..."
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
            Ejercicio activo en la biblioteca
          </label>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}
        <ModalFooter onClose={onClose} saving={saving} label={form.id ? 'Guardar' : 'Crear ejercicio'} />
      </form>
    </Modal>
  )
}

// ─── Tab Grupos musculares ────────────────────────────────────────────────────

function TabGrupos() {
  const [grupos, setGrupos] = useState<Grupo[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<{ open: boolean; data: Partial<Grupo> | null }>({ open: false, data: null })
  const [confirmDel, setConfirmDel] = useState<Grupo | null>(null)
  const [error, setError] = useState('')

  const cargar = () =>
    ejerciciosRepository.listarGrupos()
      .then(setGrupos)
      .catch(() => {})
      .finally(() => setLoading(false))

  useEffect(() => { cargar() }, [])

  const handleSave = async (data: Partial<Grupo>) => {
    setError('')
    try {
      if (data.id) {
        const { id, ...rest } = data
        await ejerciciosRepository.actualizarGrupo(id, rest)
      } else {
        await ejerciciosRepository.crearGrupo(data)
      }
      setModal({ open: false, data: null })
      cargar()
    } catch (err: any) {
      setError(getErrorMessage(err))
    }
  }

  const handleDelete = async (g: Grupo) => {
    try {
      await ejerciciosRepository.eliminarGrupo(g.id)
      setConfirmDel(null)
      cargar()
    } catch {
      setConfirmDel(null)
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
    <div className="space-y-4 max-w-2xl">
      <div className="flex justify-end">
        <button
          onClick={() => setModal({ open: true, data: {} })}
          className="btn-primary"
        >
          + Nuevo grupo
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {grupos.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-10">
            No hay grupos musculares. Crea el primero.
          </p>
        )}
        {grupos.map((g) => (
          <div key={g.id} className="flex items-center gap-4 px-5 py-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{g.nombre}</p>
              {g.descripcion && (
                <p className="text-xs text-gray-400 mt-0.5">{g.descripcion}</p>
              )}
            </div>
            <span className="text-xs text-gray-400">
              {g.ejercicios_count} ejercicio{g.ejercicios_count !== 1 ? 's' : ''}
            </span>
            <button
              onClick={() => setModal({ open: true, data: g })}
              className="text-sm text-blue-600 hover:underline"
            >
              Editar
            </button>
            <button
              onClick={() => setConfirmDel(g)}
              className="text-sm text-red-500 hover:underline"
              disabled={g.ejercicios_count > 0}
              title={g.ejercicios_count > 0 ? 'Tiene ejercicios asociados' : ''}
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>

      {modal.open && (
        <GrupoModal
          data={modal.data}
          error={error}
          onSave={handleSave}
          onClose={() => { setModal({ open: false, data: null }); setError('') }}
        />
      )}
      {confirmDel && (
        <ConfirmModal
          message={`¿Eliminar el grupo "${confirmDel.nombre}"?`}
          onConfirm={() => handleDelete(confirmDel)}
          onCancel={() => setConfirmDel(null)}
        />
      )}
    </div>
  )
}

function GrupoModal({
  data, error, onSave, onClose,
}: {
  data: Partial<Grupo> | null
  error: string
  onSave: (d: Partial<Grupo>) => void
  onClose: () => void
}) {
  const [form, setForm] = useState<Partial<Grupo>>({ nombre: '', descripcion: '', ...data })
  const [saving, setSaving] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await onSave(form)
    setSaving(false)
  }

  return (
    <Modal title={form.id ? 'Editar grupo' : 'Nuevo grupo muscular'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Nombre" required>
          <input
            className="input"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            required
          />
        </Field>
        <Field label="Descripción">
          <input
            className="input"
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
          />
        </Field>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <ModalFooter onClose={onClose} saving={saving} label={form.id ? 'Guardar' : 'Crear grupo'} />
      </form>
    </Modal>
  )
}

// ─── Shared ───────────────────────────────────────────────────────────────────

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

function Modal({
  title, onClose, children, wide,
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
  wide?: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className={`bg-white rounded-2xl shadow-xl w-full ${wide ? 'max-w-lg' : 'max-w-md'}`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>
        <div className="px-6 py-5 max-h-[80vh] overflow-y-auto">{children}</div>
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
          <button
            onClick={onConfirm}
            className="bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}
