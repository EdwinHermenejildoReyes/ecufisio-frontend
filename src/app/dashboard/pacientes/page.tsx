'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import {
  Search, Plus, Users, X, ChevronRight, AlertCircle,
  Loader2, User, Phone, Mail, Calendar, RefreshCw,
} from 'lucide-react'
import { pacientesRepository } from '@/repositories/pacientes'

/* ── Tipos ── */
interface PacienteRow {
  id: string
  nombre_completo: string
  email: string
  telefono: string
  cedula: string
  fecha_nacimiento: string | null
  sexo: string
  total_citas: number
  ultima_cita: string | null
  is_active: boolean
}

interface NuevoPacienteForm {
  nombres: string
  apellidos: string
  email: string
  telefono: string
  cedula: string
  fecha_nacimiento: string
  sexo: string
}

const FORM_EMPTY: NuevoPacienteForm = {
  nombres: '', apellidos: '', email: '', telefono: '',
  cedula: '', fecha_nacimiento: '', sexo: '',
}

/* ── Helpers ── */
function calcularEdad(fechaNac: string | null): string {
  if (!fechaNac) return '—'
  const hoy = new Date()
  const nac = new Date(fechaNac + 'T00:00:00')
  let edad = hoy.getFullYear() - nac.getFullYear()
  if (
    hoy.getMonth() < nac.getMonth() ||
    (hoy.getMonth() === nac.getMonth() && hoy.getDate() < nac.getDate())
  ) edad--
  return `${edad} años`
}

function iniciales(nombre: string): string {
  return nombre.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
}

const SEXO_LABEL: Record<string, string> = { M: 'Masculino', F: 'Femenino', O: 'Otro' }
const AVATAR_COLORS = [
  'bg-sky-100 text-sky-700', 'bg-violet-100 text-violet-700',
  'bg-emerald-100 text-emerald-700', 'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700', 'bg-cyan-100 text-cyan-700',
]
function avatarColor(id: string): string {
  const n = id.charCodeAt(0) + id.charCodeAt(id.length - 1)
  return AVATAR_COLORS[n % AVATAR_COLORS.length]
}

/* ── Modal nuevo paciente ── */
function NuevoPacienteModal({
  open, onClose, onCreado,
}: { open: boolean; onClose: () => void; onCreado: () => void }) {
  const [form, setForm] = useState<NuevoPacienteForm>(FORM_EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { if (open) { setForm(FORM_EMPTY); setError(null) } }, [open])

  const set = (k: keyof NuevoPacienteForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nombres || !form.apellidos || !form.email) {
      setError('Nombre, apellidos y correo son obligatorios.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await pacientesRepository.crear({
        ...form,
        fecha_nacimiento: form.fecha_nacimiento || undefined,
        sexo: form.sexo || undefined,
      })
      onCreado()
      onClose()
    } catch (err: any) {
      const data = err?.response?.data
      if (data?.email) setError(`Correo: ${data.email[0]}`)
      else if (data?.cedula) setError(`Cédula: ${data.cedula[0]}`)
      else if (data?.detail) setError(data.detail)
      else setError('No se pudo registrar el paciente.')
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="text-lg font-semibold text-gray-900">Nuevo paciente</h2>
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

          {/* Identidad */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombres <span className="text-red-400">*</span>
              </label>
              <input type="text" value={form.nombres} onChange={set('nombres')} placeholder="María"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apellidos <span className="text-red-400">*</span>
              </label>
              <input type="text" value={form.apellidos} onChange={set('apellidos')} placeholder="García"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo electrónico <span className="text-red-400">*</span>
            </label>
            <input type="email" value={form.email} onChange={set('email')} placeholder="maria@email.com"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono / WhatsApp</label>
              <input type="tel" value={form.telefono} onChange={set('telefono')} placeholder="+593 99 999 9999"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cédula</label>
              <input type="text" value={form.cedula} onChange={set('cedula')} placeholder="1700000000"
                maxLength={10}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de nacimiento</label>
              <input type="date" value={form.fecha_nacimiento} onChange={set('fecha_nacimiento')}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sexo</label>
              <select value={form.sexo} onChange={set('sexo')}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent">
                <option value="">Sin especificar</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
                <option value="O">Otro</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-70">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Guardando…</> : 'Registrar paciente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Página ── */
export default function PacientesPage() {
  const [pacientes, setPacientes] = useState<PacienteRow[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [filtroActivo, setFiltroActivo] = useState<'todos' | 'activos' | 'inactivos'>('activos')
  const [total, setTotal] = useState(0)
  const [modalNuevo, setModalNuevo] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cargar = useCallback(async (busqueda: string, activo: string) => {
    setLoading(true)
    try {
      const params: Record<string, string> = {}
      if (busqueda) params.q = busqueda
      if (activo !== 'todos') params.activo = activo === 'activos' ? 'true' : 'false'
      const data = await pacientesRepository.listar(params)
      const lista: PacienteRow[] = Array.isArray(data) ? data : (data.results ?? [])
      setPacientes(lista)
      setTotal(Array.isArray(data) ? lista.length : (data.count ?? lista.length))
    } catch {
      setPacientes([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [])

  /* Debounce de búsqueda */
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      cargar(q, filtroActivo)
    }, 300)
  }, [q, filtroActivo, cargar])

  return (
    <div className="flex flex-col h-full">
      {/* ── Header ── */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-gray-400" />
            <h1 className="text-lg font-semibold text-gray-900">Pacientes</h1>
            {!loading && (
              <span className="text-sm text-gray-400">
                {total} {total === 1 ? 'paciente' : 'pacientes'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Nombre, cédula o email…"
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
              {q && (
                <button onClick={() => setQ('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filtro activo/inactivo */}
            <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
              {(['todos', 'activos', 'inactivos'] as const).map((f) => (
                <button key={f} onClick={() => setFiltroActivo(f)}
                  className={`px-3 py-1.5 font-medium capitalize transition-colors ${
                    filtroActivo === f ? 'bg-sky-600 text-white' : 'text-gray-600 hover:bg-gray-50'
                  }`}>
                  {f}
                </button>
              ))}
            </div>

            {/* Refresh */}
            <button onClick={() => cargar(q, filtroActivo)} disabled={loading}
              className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50"
              title="Actualizar">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {/* Nuevo */}
            <button onClick={() => setModalNuevo(true)}
              className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
              <Plus className="w-4 h-4" />
              Nuevo paciente
            </button>
          </div>
        </div>
      </div>

      {/* ── Contenido ── */}
      <div className="flex-1 overflow-auto p-6">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-sky-500" />
          </div>
        )}

        {!loading && pacientes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Users className="w-12 h-12 mb-3 opacity-30" />
            <p className="font-medium text-gray-500">
              {q ? 'Sin resultados para esa búsqueda' : 'Aún no hay pacientes registrados'}
            </p>
            {!q && (
              <button onClick={() => setModalNuevo(true)}
                className="mt-4 flex items-center gap-1.5 text-sky-600 hover:underline text-sm font-medium">
                <Plus className="w-4 h-4" />Registrar primer paciente
              </button>
            )}
          </div>
        )}

        {!loading && pacientes.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Paciente</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide hidden md:table-cell">Contacto</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide hidden lg:table-cell">Cédula</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide hidden lg:table-cell">Edad</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide hidden sm:table-cell">Citas</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide hidden xl:table-cell">Última cita</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Estado</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pacientes.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors group">
                    {/* Avatar + nombre */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-bold ${avatarColor(p.id)}`}>
                          {iniciales(p.nombre_completo)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{p.nombre_completo}</p>
                          {p.sexo && (
                            <p className="text-xs text-gray-400">{SEXO_LABEL[p.sexo] ?? p.sexo}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Contacto */}
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="space-y-0.5">
                        {p.email && (
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span className="truncate max-w-[180px]">{p.email}</span>
                          </div>
                        )}
                        {p.telefono && (
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span>{p.telefono}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Cédula */}
                    <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">
                      {p.cedula || <span className="text-gray-300">—</span>}
                    </td>

                    {/* Edad */}
                    <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {calcularEdad(p.fecha_nacimiento)}
                      </div>
                    </td>

                    {/* Total citas */}
                    <td className="px-4 py-3 text-center hidden sm:table-cell">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-sky-50 text-sky-700 text-xs font-semibold">
                        {p.total_citas}
                      </span>
                    </td>

                    {/* Última cita */}
                    <td className="px-4 py-3 text-gray-500 text-xs hidden xl:table-cell">
                      {p.ultima_cita
                        ? new Date(p.ultima_cita + 'T00:00:00').toLocaleDateString('es-EC', { day: 'numeric', month: 'short', year: 'numeric' })
                        : <span className="text-gray-300">Sin citas</span>}
                    </td>

                    {/* Estado */}
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        p.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {p.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>

                    {/* Enlace al perfil */}
                    <td className="px-3 py-3">
                      <Link href={`/dashboard/pacientes/${p.id}`}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 flex items-center justify-center">
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <NuevoPacienteModal
        open={modalNuevo}
        onClose={() => setModalNuevo(false)}
        onCreado={() => cargar(q, filtroActivo)}
      />
    </div>
  )
}
