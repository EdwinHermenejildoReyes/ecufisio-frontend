'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import {
  CreditCard, Search, Plus, X, Loader2, RefreshCw, AlertCircle,
  CheckCircle2, RotateCcw, DollarSign, Clock, Package, TrendingUp,
} from 'lucide-react'
import { cobrosRepository } from '@/repositories/cobros'

/* ── Tipos ── */
interface PagoRow {
  id: string
  paciente_nombre: string
  paciente_id: string | null
  concepto: string
  monto: string
  metodo: string
  estado: string
  referencia: string
  notas: string
  tiene_factura: boolean
  created_at: string
}

interface PaqueteRow {
  id: string
  paciente_nombre: string
  servicio_nombre: string
  total_sesiones: number
  sesiones_usadas: number
  sesiones_disponibles: number
  precio_total: string
  estado: string
  fecha_vence: string | null
  notas: string
  created_at: string
}

interface ResumenData {
  total_hoy: string
  total_mes: string
  pendientes_count: number
  pendientes_monto: string
  pagados_hoy: number
  paquetes_activos: number
}

/* ── Config visual ── */
const METODO_LABEL: Record<string, string> = {
  efectivo: 'Efectivo', transferencia: 'Transferencia',
  tarjeta: 'Tarjeta', en_linea: 'En línea',
}
const METODO_ICON: Record<string, string> = {
  efectivo: '💵', transferencia: '🏦', tarjeta: '💳', en_linea: '🌐',
}
const ESTADO_PAGO: Record<string, { label: string; cls: string }> = {
  pendiente:   { label: 'Pendiente',   cls: 'bg-amber-100 text-amber-700' },
  pagado:      { label: 'Pagado',      cls: 'bg-emerald-100 text-emerald-700' },
  reembolsado: { label: 'Reembolsado', cls: 'bg-gray-100 text-gray-500' },
}
const ESTADO_PAQUETE: Record<string, { label: string; cls: string }> = {
  activo:    { label: 'Activo',    cls: 'bg-emerald-100 text-emerald-700' },
  agotado:   { label: 'Agotado',   cls: 'bg-amber-100 text-amber-700' },
  vencido:   { label: 'Vencido',   cls: 'bg-red-100 text-red-600' },
  cancelado: { label: 'Cancelado', cls: 'bg-gray-100 text-gray-500' },
}

function fmt(monto: string | number) {
  return `$${Number(monto).toLocaleString('es-EC', { minimumFractionDigits: 2 })}`
}

/* ── Tarjeta de resumen ── */
function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: any; label: string; value: string; sub?: string; color: string
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 px-5 py-4 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <p className="text-xl font-bold text-gray-900">{value}</p>
        {sub && <p className="text-xs text-gray-400">{sub}</p>}
      </div>
    </div>
  )
}

/* ── Modal: Registrar pago ── */
interface PagoForm {
  paciente_ref: string
  monto: string
  metodo: string
  referencia: string
  notas: string
}
const PAGO_EMPTY: PagoForm = { paciente_ref: '', monto: '', metodo: 'efectivo', referencia: '', notas: '' }

function ModalNuevoPago({ open, onClose, onCreado }: {
  open: boolean; onClose: () => void; onCreado: () => void
}) {
  const [form, setForm] = useState<PagoForm>(PAGO_EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { if (open) { setForm(PAGO_EMPTY); setError(null) } }, [open])

  const set = (k: keyof PagoForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.monto || Number(form.monto) <= 0) {
      setError('Ingresa un monto válido.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      // El pago necesita cita o paquete; como aún no hay selector de cita
      // registramos el pago con paquete vacío y monto libre (pago manual)
      // Esto se refinará cuando se integre el selector de citas
      await cobrosRepository.crearPago({
        monto: form.monto,
        metodo: form.metodo,
        referencia: form.referencia,
        notas: form.notas || `Cobro manual — ${form.paciente_ref}`,
        estado: 'pagado',
      })
      onCreado()
      onClose()
    } catch (err: any) {
      const d = err?.response?.data
      if (d?.non_field_errors) setError(d.non_field_errors[0])
      else if (d?.detail) setError(d.detail)
      else if (d?.monto) setError(`Monto: ${d.monto[0]}`)
      else setError('No se pudo registrar el pago.')
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Registrar cobro</h2>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Paciente / Referencia</label>
            <input type="text" value={form.paciente_ref} onChange={set('paciente_ref')}
              placeholder="Nombre del paciente u observación..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monto <span className="text-red-400">*</span></label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input type="number" min="0.01" step="0.01" value={form.monto} onChange={set('monto')}
                  placeholder="0.00"
                  className="w-full border border-gray-200 rounded-lg pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Método</label>
              <select value={form.metodo} onChange={set('metodo')}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent">
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="en_linea">En línea</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">N.º referencia / comprobante</label>
            <input type="text" value={form.referencia} onChange={set('referencia')}
              placeholder="Número de transferencia, recibo..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
            <textarea value={form.notas} onChange={set('notas')} rows={2}
              placeholder="Observaciones adicionales..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-70">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Guardando…</> : 'Registrar cobro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Modal: Nuevo paquete ── */
interface PaqueteForm {
  paciente_id: string
  servicio_id: string
  total_sesiones: string
  precio_total: string
  fecha_vence: string
  notas: string
}
const PKG_EMPTY: PaqueteForm = {
  paciente_id: '', servicio_id: '', total_sesiones: '10', precio_total: '', fecha_vence: '', notas: '',
}

function ModalNuevoPaquete({ open, onClose, onCreado }: {
  open: boolean; onClose: () => void; onCreado: () => void
}) {
  const [form, setForm] = useState<PaqueteForm>(PKG_EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { if (open) { setForm(PKG_EMPTY); setError(null) } }, [open])

  const set = (k: keyof PaqueteForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.paciente_id || !form.servicio_id || !form.precio_total) {
      setError('Completa los campos obligatorios.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await cobrosRepository.crearPaquete({
        paciente: form.paciente_id,
        servicio: form.servicio_id,
        total_sesiones: parseInt(form.total_sesiones),
        precio_total: form.precio_total,
        fecha_vence: form.fecha_vence || undefined,
        notas: form.notas,
      })
      onCreado()
      onClose()
    } catch (err: any) {
      const d = err?.response?.data
      if (d?.detail) setError(d.detail)
      else if (d?.paciente) setError(`Paciente: ${d.paciente[0]}`)
      else setError('No se pudo crear el paquete.')
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Nuevo paquete de sesiones</h2>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ID Paciente <span className="text-red-400">*</span></label>
            <input type="text" value={form.paciente_id} onChange={set('paciente_id')}
              placeholder="UUID del paciente"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent" />
            <p className="text-xs text-gray-400 mt-1">Búsqueda integrada con el módulo de pacientes próximamente</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ID Servicio <span className="text-red-400">*</span></label>
            <input type="text" value={form.servicio_id} onChange={set('servicio_id')}
              placeholder="UUID del servicio"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">N.º sesiones <span className="text-red-400">*</span></label>
              <input type="number" min="1" value={form.total_sesiones} onChange={set('total_sesiones')}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio total <span className="text-red-400">*</span></label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input type="number" min="0.01" step="0.01" value={form.precio_total} onChange={set('precio_total')}
                  placeholder="0.00"
                  className="w-full border border-gray-200 rounded-lg pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent" />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de vencimiento</label>
            <input type="date" value={form.fecha_vence} onChange={set('fecha_vence')}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
            <input type="text" value={form.notas} onChange={set('notas')}
              placeholder="Condiciones especiales, descuentos..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-70">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Creando…</> : 'Crear paquete'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Tab Pagos ── */
function TabPagos({ q, reload }: { q: string; reload: number }) {
  const [pagos, setPagos] = useState<PagoRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroMetodo, setFiltroMetodo] = useState('')
  const [modalNuevo, setModalNuevo] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const cargar = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string> = {}
      if (q) params.q = q
      if (filtroEstado) params.estado = filtroEstado
      if (filtroMetodo) params.metodo = filtroMetodo
      const data = await cobrosRepository.listarPagos(params)
      setPagos(Array.isArray(data) ? data : (data.results ?? []))
    } catch { setPagos([]) } finally { setLoading(false) }
  }, [q, filtroEstado, filtroMetodo])

  useEffect(() => { cargar() }, [cargar, reload])

  const doAction = async (id: string, action: 'pagado' | 'reembolso') => {
    setActionLoading(id)
    try {
      if (action === 'pagado') await cobrosRepository.marcarPagado(id)
      else await cobrosRepository.reembolsar(id)
      cargar()
    } finally { setActionLoading(null) }
  }

  return (
    <>
      {/* Filtros */}
      <div className="flex items-center gap-3 flex-wrap mb-4">
        <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
          {[['', 'Todos'], ['pendiente', 'Pendientes'], ['pagado', 'Pagados'], ['reembolsado', 'Reembolsados']].map(([v, l]) => (
            <button key={v} onClick={() => setFiltroEstado(v)}
              className={`px-3 py-1.5 font-medium transition-colors ${filtroEstado === v ? 'bg-sky-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
              {l}
            </button>
          ))}
        </div>
        <select value={filtroMetodo} onChange={(e) => setFiltroMetodo(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent">
          <option value="">Todos los métodos</option>
          <option value="efectivo">Efectivo</option>
          <option value="transferencia">Transferencia</option>
          <option value="tarjeta">Tarjeta</option>
          <option value="en_linea">En línea</option>
        </select>
        <div className="ml-auto">
          <button onClick={() => setModalNuevo(true)}
            className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
            <Plus className="w-4 h-4" />Registrar cobro
          </button>
        </div>
      </div>

      {loading && <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-sky-500" /></div>}

      {!loading && pagos.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Sin cobros registrados</p>
        </div>
      )}

      {!loading && pagos.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Paciente / Concepto</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Monto</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Método</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Fecha</th>
                <th className="w-32" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pagos.map((p) => {
                const estadoCfg = ESTADO_PAGO[p.estado] ?? { label: p.estado, cls: 'bg-gray-100 text-gray-600' }
                const isLoading = actionLoading === p.id
                return (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{p.paciente_nombre}</p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[220px]">{p.concepto}</p>
                      {p.referencia && <p className="text-xs text-gray-400 font-mono">{p.referencia}</p>}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">{fmt(p.monto)}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="flex items-center gap-1.5 text-gray-600">
                        <span>{METODO_ICON[p.metodo]}</span>
                        {METODO_LABEL[p.metodo] ?? p.metodo}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${estadoCfg.cls}`}>
                        {estadoCfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 hidden lg:table-cell">
                      {new Date(p.created_at).toLocaleDateString('es-EC', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        {p.estado === 'pendiente' && (
                          <button onClick={() => doAction(p.id, 'pagado')} disabled={isLoading}
                            title="Marcar como pagado"
                            className="flex items-center gap-1 text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-2.5 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50">
                            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                            Cobrar
                          </button>
                        )}
                        {p.estado === 'pagado' && (
                          <button onClick={() => doAction(p.id, 'reembolso')} disabled={isLoading}
                            title="Registrar reembolso"
                            className="flex items-center gap-1 text-xs bg-gray-50 hover:bg-gray-100 text-gray-600 px-2.5 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50">
                            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                            Devolver
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <ModalNuevoPago open={modalNuevo} onClose={() => setModalNuevo(false)} onCreado={cargar} />
    </>
  )
}

/* ── Tab Paquetes ── */
function TabPaquetes({ q, reload }: { q: string; reload: number }) {
  const [paquetes, setPaquetes] = useState<PaqueteRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroEstado, setFiltroEstado] = useState('')
  const [modalNuevo, setModalNuevo] = useState(false)
  const [cancelLoading, setCancelLoading] = useState<string | null>(null)

  const cargar = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string> = {}
      if (q) params.q = q
      if (filtroEstado) params.estado = filtroEstado
      const data = await cobrosRepository.listarPaquetes(params)
      setPaquetes(Array.isArray(data) ? data : (data.results ?? []))
    } catch { setPaquetes([]) } finally { setLoading(false) }
  }, [q, filtroEstado])

  useEffect(() => { cargar() }, [cargar, reload])

  const cancelar = async (id: string) => {
    if (!confirm('¿Cancelar este paquete?')) return
    setCancelLoading(id)
    try { await cobrosRepository.cancelarPaquete(id); cargar() }
    finally { setCancelLoading(null) }
  }

  return (
    <>
      {/* Filtros */}
      <div className="flex items-center gap-3 flex-wrap mb-4">
        <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
          {[['', 'Todos'], ['activo', 'Activos'], ['agotado', 'Agotados'], ['vencido', 'Vencidos']].map(([v, l]) => (
            <button key={v} onClick={() => setFiltroEstado(v)}
              className={`px-3 py-1.5 font-medium transition-colors ${filtroEstado === v ? 'bg-sky-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
              {l}
            </button>
          ))}
        </div>
        <div className="ml-auto">
          <button onClick={() => setModalNuevo(true)}
            className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
            <Plus className="w-4 h-4" />Nuevo paquete
          </button>
        </div>
      </div>

      {loading && <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-sky-500" /></div>}

      {!loading && paquetes.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Sin paquetes registrados</p>
        </div>
      )}

      {!loading && paquetes.length > 0 && (
        <div className="space-y-3">
          {paquetes.map((pk) => {
            const estadoCfg = ESTADO_PAQUETE[pk.estado] ?? { label: pk.estado, cls: 'bg-gray-100 text-gray-500' }
            const pct = pk.total_sesiones > 0 ? Math.round((pk.sesiones_usadas / pk.total_sesiones) * 100) : 0
            const isCanceling = cancelLoading === pk.id
            return (
              <div key={pk.id} className="bg-white rounded-xl border border-gray-100 px-5 py-4 hover:border-gray-200 transition-colors">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-gray-900">{pk.paciente_nombre}</p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${estadoCfg.cls}`}>
                        {estadoCfg.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{pk.servicio_nombre}</p>
                    {pk.notas && <p className="text-xs text-gray-400 mt-1">{pk.notas}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold text-gray-900">{fmt(pk.precio_total)}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(pk.created_at).toLocaleDateString('es-EC', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                {/* Progreso de sesiones */}
                <div className="mt-3 space-y-1.5">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{pk.sesiones_usadas} de {pk.total_sesiones} sesiones usadas</span>
                    <span className="font-medium">{pk.sesiones_disponibles} disponibles</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        pct >= 80 ? 'bg-amber-400' : pct >= 100 ? 'bg-red-400' : 'bg-sky-500'
                      }`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Pie */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                  <div>
                    {pk.fecha_vence && (
                      <p className="text-xs text-gray-400">
                        Vence: {new Date(pk.fecha_vence + 'T00:00:00').toLocaleDateString('es-EC', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                  {pk.estado === 'activo' && (
                    <button onClick={() => cancelar(pk.id)} disabled={isCanceling}
                      className="text-xs text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1 disabled:opacity-50">
                      {isCanceling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                      Cancelar paquete
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <ModalNuevoPaquete open={modalNuevo} onClose={() => setModalNuevo(false)} onCreado={cargar} />
    </>
  )
}

/* ── Página principal ── */
type Tab = 'pagos' | 'paquetes'

export default function CobrosPage() {
  const [tab, setTab] = useState<Tab>('pagos')
  const [q, setQ] = useState('')
  const [resumen, setResumen] = useState<ResumenData | null>(null)
  const [reload, setReload] = useState(0)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [debouncedQ, setDebouncedQ] = useState('')

  // Resumen
  useEffect(() => {
    cobrosRepository.resumen().then(setResumen).catch(() => {})
  }, [reload])

  // Debounce búsqueda
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedQ(q), 300)
  }, [q])

  const triggerReload = () => setReload((r) => r + 1)

  return (
    <div className="flex flex-col h-full">
      {/* ── Header ── */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-gray-400" />
            <h1 className="text-lg font-semibold text-gray-900">Cobros</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Paciente o referencia…"
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-56 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
              {q && (
                <button onClick={() => setQ('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button onClick={triggerReload} className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50" title="Actualizar">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Contenido ── */}
      <div className="flex-1 overflow-auto p-6 space-y-5">

        {/* Resumen */}
        {resumen && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard icon={TrendingUp} label="Cobrado hoy" value={fmt(resumen.total_hoy)}
              sub={`${resumen.pagados_hoy} cobro${resumen.pagados_hoy !== 1 ? 's' : ''}`}
              color="bg-emerald-100 text-emerald-600" />
            <StatCard icon={DollarSign} label="Cobrado este mes" value={fmt(resumen.total_mes)}
              color="bg-sky-100 text-sky-600" />
            <StatCard icon={Clock} label="Pendientes" value={fmt(resumen.pendientes_monto)}
              sub={`${resumen.pendientes_count} cobro${resumen.pendientes_count !== 1 ? 's' : ''}`}
              color="bg-amber-100 text-amber-600" />
            <StatCard icon={Package} label="Paquetes activos" value={String(resumen.paquetes_activos)}
              color="bg-violet-100 text-violet-600" />
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-100">
          {([['pagos', 'Pagos', CreditCard], ['paquetes', 'Paquetes de sesiones', Package]] as const).map(([id, label, Icon]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                tab === id ? 'border-sky-600 text-sky-700' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
        </div>

        {tab === 'pagos' && <TabPagos q={debouncedQ} reload={reload} />}
        {tab === 'paquetes' && <TabPaquetes q={debouncedQ} reload={reload} />}
      </div>
    </div>
  )
}
