'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Dumbbell, Search, Plus, X, Loader2, AlertCircle,
  ExternalLink, Pencil, Trash2, RefreshCw,
} from 'lucide-react'
import { ejerciciosRepository } from '@/repositories/ejercicios'
import { getErrorMessage } from '@/utils/errorMessages'

/* ── Tipos ── */
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

/* ── Constantes ── */
const TABS = [
  { id: 'biblioteca', label: 'Biblioteca' },
  { id: 'grupos',     label: 'Grupos musculares' },
]

const CATEGORIAS = [
  { value: '',             label: 'Todas' },
  { value: 'fuerza',       label: 'Fuerza' },
  { value: 'flexibilidad', label: 'Flexibilidad' },
  { value: 'equilibrio',   label: 'Equilibrio' },
  { value: 'cardio',       label: 'Cardio' },
  { value: 'funcional',    label: 'Funcional' },
]

export const CAT_COLOR: Record<string, string> = {
  fuerza:       'bg-red-100 text-red-700',
  flexibilidad: 'bg-emerald-100 text-emerald-700',
  equilibrio:   'bg-blue-100 text-blue-700',
  cardio:       'bg-orange-100 text-orange-700',
  funcional:    'bg-violet-100 text-violet-700',
}

const INPUT = 'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent'
const BTN_PRIMARY = 'flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-70 disabled:cursor-not-allowed'
const BTN_SECONDARY = 'border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors'

/* ── Página ── */
export default function EjerciciosPage() {
  const [tab, setTab] = useState('biblioteca')

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-gray-100 px-6 pt-4">
        <div className="flex items-center gap-3 mb-4">
          <Dumbbell className="w-5 h-5 text-gray-400" />
          <h1 className="text-lg font-semibold text-gray-900">Ejercicios</h1>
        </div>
        <div className="flex gap-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
                tab === t.id
                  ? 'border-sky-600 text-sky-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {tab === 'biblioteca' && <TabBiblioteca />}
        {tab === 'grupos'     && <TabGrupos />}
      </div>
    </div>
  )
}

/* ── Tab Biblioteca ── */
function TabBiblioteca() {
  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([])
  const [grupos, setGrupos] = useState<Grupo[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [categoria, setCategoria] = useState('')
  const [grupoFiltro, setGrupoFiltro] = useState('')
  const [modal, setModal] = useState<{ open: boolean; id: number | null }>({ open: false, id: null })
  const [detalle, setDetalle] = useState<Ejercicio | null>(null)
  const [confirmDel, setConfirmDel] = useState<Ejercicio | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const loadEjercicios = (p: Record<string, any>) => {
    setLoading(true)
    ejerciciosRepository.listar(p)
      .then((data) => setEjercicios(Array.isArray(data) ? data : (data.results ?? [])))
      .catch(() => setEjercicios([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    ejerciciosRepository.listarGrupos()
      .then((data) => setGrupos(Array.isArray(data) ? data : (data.results ?? [])))
      .catch(() => {})
  }, [])

  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      loadEjercicios({ q: q || undefined, categoria: categoria || undefined, grupo_muscular: grupoFiltro || undefined })
    }, 300)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, categoria, grupoFiltro])

  const recargar = () =>
    loadEjercicios({ q: q || undefined, categoria: categoria || undefined, grupo_muscular: grupoFiltro || undefined })

  const handleDelete = async (e: Ejercicio) => {
    try { await ejerciciosRepository.eliminar(e.id) } catch {}
    setConfirmDel(null)
    recargar()
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar ejercicio…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9 border border-gray-200 rounded-lg px-3 py-2 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          />
          {q && (
            <button onClick={() => setQ('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <select
          value={grupoFiltro}
          onChange={(e) => setGrupoFiltro(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
        >
          <option value="">Todos los grupos</option>
          {grupos.map((g) => <option key={g.id} value={g.id}>{g.nombre}</option>)}
        </select>
        <div className="flex gap-1.5 flex-wrap">
          {CATEGORIAS.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategoria(c.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                categoria === c.value
                  ? 'bg-sky-600 text-white border-sky-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-sky-400'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={recargar} disabled={loading}
            className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            title="Actualizar">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => setModal({ open: true, id: null })} className={BTN_PRIMARY}>
            <Plus className="w-4 h-4" />Nuevo ejercicio
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="w-6 h-6 animate-spin text-sky-500" />
        </div>
      ) : ejercicios.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Dumbbell className="w-12 h-12 mb-3 opacity-20" />
          <p className="font-medium text-gray-500">
            {q || categoria || grupoFiltro ? 'Sin resultados para ese filtro' : 'No hay ejercicios en la biblioteca'}
          </p>
          {!q && !categoria && !grupoFiltro && (
            <button onClick={() => setModal({ open: true, id: null })}
              className="mt-3 text-sky-600 hover:underline text-sm font-medium flex items-center gap-1">
              <Plus className="w-4 h-4" />Crear primer ejercicio
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {ejercicios.map((e) => (
            <EjercicioCard
              key={e.id}
              ejercicio={e}
              onVer={() => setDetalle(e)}
              onEditar={() => setModal({ open: true, id: e.id })}
              onEliminar={() => setConfirmDel(e)}
            />
          ))}
        </div>
      )}

      {modal.open && (
        <EjercicioModal
          id={modal.id}
          grupos={grupos}
          onSaved={() => { setModal({ open: false, id: null }); recargar() }}
          onClose={() => setModal({ open: false, id: null })}
        />
      )}

      {detalle && (
        <EjercicioDetalleModal
          ejercicio={detalle}
          onEditar={() => { setModal({ open: true, id: detalle.id }); setDetalle(null) }}
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

/* ── Tarjeta de ejercicio ── */
function EjercicioCard({ ejercicio, onVer, onEditar, onEliminar }: {
  ejercicio: Ejercicio; onVer: () => void; onEditar: () => void; onEliminar: () => void
}) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-3 hover:shadow-sm transition-shadow ${
      !ejercicio.is_active ? 'opacity-60' : ''
    }`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-gray-900 leading-snug flex-1">{ejercicio.nombre}</p>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${CAT_COLOR[ejercicio.categoria] ?? 'bg-gray-100 text-gray-600'}`}>
          {CATEGORIAS.find((c) => c.value === ejercicio.categoria)?.label ?? ejercicio.categoria}
        </span>
      </div>

      {ejercicio.grupo_muscular_nombre && (
        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full w-fit">
          {ejercicio.grupo_muscular_nombre}
        </span>
      )}

      <p className="text-xs text-gray-500 line-clamp-2 flex-1">{ejercicio.descripcion}</p>

      {ejercicio.video_url && (
        <a href={ejercicio.video_url} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-sky-600 hover:underline"
          onClick={(e) => e.stopPropagation()}>
          <ExternalLink className="w-3 h-3" />Ver video
        </a>
      )}

      <div className="flex gap-2 pt-1 border-t border-gray-100 items-center">
        <button onClick={onVer} className="text-xs text-gray-500 hover:text-gray-700">Ver</button>
        <button onClick={onEditar} className="flex items-center gap-0.5 text-xs text-sky-600 hover:underline">
          <Pencil className="w-3 h-3" />Editar
        </button>
        <button onClick={onEliminar} className="flex items-center gap-0.5 text-xs text-red-500 hover:underline ml-auto">
          <Trash2 className="w-3 h-3" />Eliminar
        </button>
      </div>
    </div>
  )
}

/* ── Modal detalle ── */
function EjercicioDetalleModal({ ejercicio, onEditar, onClose }: {
  ejercicio: Ejercicio; onEditar: () => void; onClose: () => void
}) {
  const [full, setFull] = useState<Ejercicio | null>(null)

  useEffect(() => {
    ejerciciosRepository.obtener(ejercicio.id).then(setFull).catch(() => setFull(ejercicio))
  }, [ejercicio.id])

  const data = full ?? ejercicio

  return (
    <Modal title={data.nombre} onClose={onClose} wide>
      <div className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CAT_COLOR[data.categoria] ?? 'bg-gray-100 text-gray-600'}`}>
            {CATEGORIAS.find((c) => c.value === data.categoria)?.label ?? data.categoria}
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

        <Section label="Descripción">
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{data.descripcion}</p>
        </Section>

        {data.instrucciones && (
          <Section label="Instrucciones">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{data.instrucciones}</p>
          </Section>
        )}

        {data.video_url && (
          <Section label="Video">
            <a href={data.video_url} target="_blank" rel="noopener noreferrer"
              className="text-sm text-sky-600 hover:underline break-all flex items-center gap-1">
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />{data.video_url}
            </a>
          </Section>
        )}

        <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
          <button onClick={onClose} className={BTN_SECONDARY}>Cerrar</button>
          <button onClick={onEditar} className={BTN_PRIMARY}>
            <Pencil className="w-4 h-4" />Editar
          </button>
        </div>
      </div>
    </Modal>
  )
}

/* ── Modal crear/editar ejercicio ── */
function EjercicioModal({ id, grupos, onSaved, onClose }: {
  id: number | null; grupos: Grupo[]; onSaved: () => void; onClose: () => void
}) {
  const [form, setForm] = useState({
    nombre: '', descripcion: '', instrucciones: '', categoria: 'funcional',
    grupo_muscular: '' as string | number, video_url: '', is_active: true,
  })
  const [saving, setSaving] = useState(false)
  const [loadingData, setLoadingData] = useState(!!id)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    ejerciciosRepository.obtener(id)
      .then((e) => setForm({
        nombre: e.nombre,
        descripcion: e.descripcion,
        instrucciones: e.instrucciones ?? '',
        categoria: e.categoria,
        grupo_muscular: e.grupo_muscular ?? '',
        video_url: e.video_url ?? '',
        is_active: e.is_active,
      }))
      .catch(() => {})
      .finally(() => setLoadingData(false))
  }, [id])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const payload = {
        ...form,
        grupo_muscular: form.grupo_muscular !== '' ? Number(form.grupo_muscular) : null,
      }
      if (id) {
        await ejerciciosRepository.actualizar(id, payload)
      } else {
        await ejerciciosRepository.crear(payload)
      }
      onSaved()
    } catch (err: any) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  if (loadingData) return (
    <Modal title="Cargando…" onClose={onClose} wide>
      <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-sky-500" /></div>
    </Modal>
  )

  return (
    <Modal title={id ? 'Editar ejercicio' : 'Nuevo ejercicio'} onClose={onClose} wide>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Nombre" required>
          <input className={INPUT} value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Categoría" required>
            <select className={INPUT} value={form.categoria}
              onChange={(e) => setForm({ ...form, categoria: e.target.value })}>
              {CATEGORIAS.filter((c) => c.value).map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Grupo muscular">
            <select className={INPUT} value={form.grupo_muscular}
              onChange={(e) => setForm({ ...form, grupo_muscular: e.target.value })}>
              <option value="">Sin grupo</option>
              {grupos.map((g) => <option key={g.id} value={g.id}>{g.nombre}</option>)}
            </select>
          </Field>
        </div>

        <Field label="Descripción" required>
          <textarea className={`${INPUT} min-h-[80px] resize-none`} value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })} required />
        </Field>

        <Field label="Instrucciones">
          <textarea className={`${INPUT} min-h-[80px] resize-none`} value={form.instrucciones}
            onChange={(e) => setForm({ ...form, instrucciones: e.target.value })}
            placeholder="Paso a paso para realizar el ejercicio…" />
        </Field>

        <Field label="URL de video">
          <input type="url" className={INPUT} value={form.video_url}
            onChange={(e) => setForm({ ...form, video_url: e.target.value })}
            placeholder="https://youtube.com/…" />
        </Field>

        {id && (
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input type="checkbox" checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="rounded" />
            Ejercicio activo en la biblioteca
          </label>
        )}

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
            <AlertCircle className="w-4 h-4 shrink-0" />{error}
          </div>
        )}

        <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
          <button type="button" onClick={onClose} className={BTN_SECONDARY}>Cancelar</button>
          <button type="submit" disabled={saving} className={BTN_PRIMARY}>
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? 'Guardando…' : id ? 'Guardar' : 'Crear ejercicio'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

/* ── Tab Grupos musculares ── */
function TabGrupos() {
  const [grupos, setGrupos] = useState<Grupo[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<{ open: boolean; data: Partial<Grupo> | null }>({ open: false, data: null })
  const [confirmDel, setConfirmDel] = useState<Grupo | null>(null)
  const [error, setError] = useState('')

  const cargar = () =>
    ejerciciosRepository.listarGrupos()
      .then((data) => setGrupos(Array.isArray(data) ? data : (data.results ?? [])))
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
    try { await ejerciciosRepository.eliminarGrupo(g.id) } catch {}
    setConfirmDel(null)
    cargar()
  }

  if (loading) return (
    <div className="flex items-center justify-center h-40">
      <Loader2 className="w-6 h-6 animate-spin text-sky-500" />
    </div>
  )

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex justify-end">
        <button onClick={() => setModal({ open: true, data: {} })} className={BTN_PRIMARY}>
          <Plus className="w-4 h-4" />Nuevo grupo
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
              {g.descripcion && <p className="text-xs text-gray-400 mt-0.5">{g.descripcion}</p>}
            </div>
            <span className="text-xs text-gray-400">
              {g.ejercicios_count} ejercicio{g.ejercicios_count !== 1 ? 's' : ''}
            </span>
            <button onClick={() => setModal({ open: true, data: g })}
              className="text-sm text-sky-600 hover:underline">
              Editar
            </button>
            <button onClick={() => setConfirmDel(g)}
              disabled={g.ejercicios_count > 0}
              title={g.ejercicios_count > 0 ? 'Tiene ejercicios asociados' : ''}
              className="text-sm text-red-500 hover:underline disabled:opacity-40 disabled:cursor-not-allowed">
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

function GrupoModal({ data, error, onSave, onClose }: {
  data: Partial<Grupo> | null; error: string; onSave: (d: Partial<Grupo>) => void; onClose: () => void
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
          <input className={INPUT} value={form.nombre ?? ''}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
        </Field>
        <Field label="Descripción">
          <input className={INPUT} value={form.descripcion ?? ''}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
        </Field>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
          <button type="button" onClick={onClose} className={BTN_SECONDARY}>Cancelar</button>
          <button type="submit" disabled={saving} className={BTN_PRIMARY}>
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? 'Guardando…' : form.id ? 'Guardar' : 'Crear grupo'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

/* ── Componentes compartidos ── */
function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      {children}
    </div>
  )
}

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

function Modal({ title, onClose, children, wide }: {
  title: string; onClose: () => void; children: React.ReactNode; wide?: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className={`bg-white rounded-2xl shadow-xl w-full ${wide ? 'max-w-lg' : 'max-w-md'}`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-5 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}

function ConfirmModal({ message, onConfirm, onCancel }: {
  message: string; onConfirm: () => void; onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
        <p className="text-sm text-gray-700">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className={BTN_SECONDARY}>Cancelar</button>
          <button onClick={onConfirm}
            className="bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}
