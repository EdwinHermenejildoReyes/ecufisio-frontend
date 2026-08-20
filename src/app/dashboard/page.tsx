'use client'

import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import Link from 'next/link'
import {
  Calendar,
  Users,
  Clock,
  DollarSign,
  Plus,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  ClipboardList,
} from 'lucide-react'
import api from '@/services/api'

/* ── Tipos ── */
interface CitaResumen {
  id: string
  paciente_nombre: string
  fisioterapeuta_nombre: string
  servicio_nombre: string
  fecha_hora: string
  estado: string
  duracion_minutos: number
}

interface Stats {
  citas_hoy: number
  pacientes_activos: number
  pendientes: number
  ingresos_mes: number
}

/* ── Configuración de estados de cita ── */
const ESTADO: Record<string, { label: string; bg: string; icon: React.ElementType }> = {
  pendiente:  { label: 'Pendiente',  bg: 'bg-amber-50 text-amber-700',    icon: AlertCircle  },
  confirmada: { label: 'Confirmada', bg: 'bg-sky-50 text-sky-700',        icon: CheckCircle2 },
  en_curso:   { label: 'En curso',   bg: 'bg-emerald-50 text-emerald-700',icon: Clock        },
  completada: { label: 'Completada', bg: 'bg-gray-100 text-gray-500',     icon: CheckCircle2 },
  cancelada:  { label: 'Cancelada',  bg: 'bg-red-50 text-red-600',        icon: XCircle      },
  no_asistio: { label: 'No asistió', bg: 'bg-red-50 text-red-600',        icon: XCircle      },
}

/* ── Componentes ── */
function StatCard({
  title, value, icon: Icon, color, href, prefix = '',
}: {
  title: string; value: number | string; icon: React.ElementType
  color: string; href: string; prefix?: string
}) {
  return (
    <Link
      href={href}
      className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-all group"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {prefix}{typeof value === 'number' ? value.toLocaleString('es-EC') : value}
          </p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </Link>
  )
}

/* ── Página ── */
export default function DashboardPage() {
  const { user } = useSelector((state: any) => state.auth)

  const [stats, setStats] = useState<Stats>({
    citas_hoy: 0, pacientes_activos: 0, pendientes: 0, ingresos_mes: 0,
  })
  const [citasHoy, setCitasHoy] = useState<CitaResumen[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    Promise.all([
      api.get(`/agenda/citas/?fecha=${today}&page_size=1`).catch(() => ({ data: { count: 0 } })),
      api.get('/pacientes/?page_size=1').catch(() => ({ data: { count: 0 } })),
      api.get(`/agenda/citas/?estado=pendiente&fecha=${today}&page_size=1`).catch(() => ({ data: { count: 0 } })),
      api.get('/pagos/resumen-mes/').catch(() => ({ data: { total: 0 } })),
      api.get(`/agenda/citas/?fecha=${today}&ordering=fecha_hora&page_size=50`).catch(() => ({ data: { results: [] } })),
    ]).then(([citasRes, pacientesRes, pendientesRes, ingresosRes, listaRes]) => {
      setStats({
        citas_hoy:        citasRes.data.count      ?? 0,
        pacientes_activos: pacientesRes.data.count  ?? 0,
        pendientes:        pendientesRes.data.count ?? 0,
        ingresos_mes:      ingresosRes.data.total   ?? 0,
      })
      setCitasHoy(listaRes.data.results ?? [])
    }).finally(() => setLoading(false))
  }, [])

  const nombre = user?.nombres?.split(' ')[0] ?? 'Usuario'

  const fechaHoy = new Date().toLocaleDateString('es-EC', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">

      {/* ─── Header ─── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 capitalize">
            Hola, {nombre}
          </h1>
          <p className="text-gray-400 text-sm mt-0.5 capitalize">{fechaHoy}</p>
        </div>
        <Link
          href="/dashboard/agenda"
          className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva cita
        </Link>
      </div>

      {/* ─── Stats ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Citas hoy"
          value={stats.citas_hoy}
          icon={Calendar}
          color="bg-sky-500"
          href="/dashboard/agenda"
        />
        <StatCard
          title="Pacientes activos"
          value={stats.pacientes_activos}
          icon={Users}
          color="bg-violet-500"
          href="/dashboard/pacientes"
        />
        <StatCard
          title="Pendientes"
          value={stats.pendientes}
          icon={Clock}
          color="bg-amber-500"
          href="/dashboard/agenda"
        />
        <StatCard
          title="Ingresos del mes"
          value={stats.ingresos_mes}
          icon={DollarSign}
          color="bg-emerald-500"
          href="/dashboard/pagos"
          prefix="$"
        />
      </div>

      {/* ─── Cuerpo principal ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Agenda del día */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Agenda de hoy</h2>
            <Link
              href="/dashboard/agenda"
              className="text-sm text-sky-600 hover:text-sky-700 font-medium flex items-center gap-1"
            >
              Ver agenda <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex-1 divide-y divide-gray-50">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-5 h-5 text-sky-400 animate-spin" />
              </div>
            ) : citasHoy.length === 0 ? (
              <div className="text-center py-16">
                <Calendar className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-400 font-medium">Sin citas para hoy</p>
                <p className="text-xs text-gray-300 mt-1 mb-4">Agenda la primera cita del día</p>
                <Link
                  href="/dashboard/agenda"
                  className="inline-flex items-center gap-1.5 text-sm text-sky-600 hover:text-sky-700 font-medium"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Agendar cita
                </Link>
              </div>
            ) : (
              citasHoy.map((cita) => {
                const cfg = ESTADO[cita.estado] ?? ESTADO.pendiente
                const StatusIcon = cfg.icon
                const hora = new Date(cita.fecha_hora).toLocaleTimeString('es-EC', {
                  hour: '2-digit', minute: '2-digit',
                })
                return (
                  <div
                    key={cita.id}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors"
                  >
                    {/* Hora */}
                    <div className="w-12 shrink-0 text-center">
                      <span className="text-sm font-bold text-gray-800">{hora}</span>
                    </div>

                    {/* Separador */}
                    <div className="w-px h-8 bg-gray-100 shrink-0" />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {cita.paciente_nombre}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {cita.servicio_nombre} · {cita.fisioterapeuta_nombre} · {cita.duracion_minutos} min
                      </p>
                    </div>

                    {/* Estado */}
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ${cfg.bg}`}>
                      <StatusIcon className="w-3 h-3" />
                      {cfg.label}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Panel derecho */}
        <div className="space-y-4">

          {/* Acciones rápidas */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Acciones rápidas</h2>
            <div className="space-y-2">
              {[
                {
                  href: '/dashboard/agenda',
                  label: 'Nueva cita',
                  icon: Calendar,
                  style: 'bg-sky-50 text-sky-700 hover:bg-sky-100',
                },
                {
                  href: '/dashboard/pacientes',
                  label: 'Nuevo paciente',
                  icon: Users,
                  style: 'bg-violet-50 text-violet-700 hover:bg-violet-100',
                },
                {
                  href: '/dashboard/pagos',
                  label: 'Registrar cobro',
                  icon: DollarSign,
                  style: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
                },
                {
                  href: '/dashboard/expediente',
                  label: 'Expedientes',
                  icon: ClipboardList,
                  style: 'bg-amber-50 text-amber-700 hover:bg-amber-100',
                },
              ].map(({ href, label, icon: Icon, style }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${style}`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Resumen del día */}
          <div className="bg-sky-600 rounded-xl p-5 text-white">
            <p className="text-sky-200 text-xs font-semibold uppercase tracking-widest mb-2">
              Resumen de hoy
            </p>
            <p className="text-5xl font-bold">{stats.citas_hoy}</p>
            <p className="text-sky-100 text-sm mt-1">
              {stats.citas_hoy === 1 ? 'cita programada' : 'citas programadas'}
            </p>
            <div className="mt-4 pt-4 border-t border-sky-500 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-sky-200">Pendientes</span>
                <span className="font-bold">{stats.pendientes}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-sky-200">Completadas</span>
                <span className="font-bold">
                  {citasHoy.filter(c => c.estado === 'completada').length}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
