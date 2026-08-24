'use client'

import { useState, useEffect, useCallback } from 'react'
import { reportesRepository } from '@/repositories/reportes'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const PERIODOS = [
  { value: '7d', label: '7 días' },
  { value: '30d', label: '30 días' },
  { value: '90d', label: '90 días' },
  { value: '12m', label: '12 meses' },
]

const TABS = [
  { id: 'ingresos', label: 'Ingresos' },
  { id: 'citas', label: 'Citas' },
  { id: 'pacientes', label: 'Pacientes' },
  { id: 'ocupacion', label: 'Fisioterapeutas' },
]

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

const ESTADO_LABELS: Record<string, string> = {
  pendiente: 'Pendiente',
  confirmada: 'Confirmada',
  en_curso: 'En curso',
  completada: 'Completada',
  cancelada: 'Cancelada',
  no_asistio: 'No asistió',
}

const METODO_LABELS: Record<string, string> = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia',
  tarjeta: 'Tarjeta',
  cheque: 'Cheque',
}

const SEXO_LABELS: Record<string, string> = {
  masculino: 'Masculino',
  femenino: 'Femenino',
  otro: 'Otro',
  no_especificado: 'No especificado',
}

function KpiCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
      Sin datos para el período seleccionado
    </div>
  )
}

export default function ReportesPage() {
  const [tab, setTab] = useState('ingresos')
  const [periodo, setPeriodo] = useState('30d')
  const [loading, setLoading] = useState(false)

  const [ingresos, setIngresos] = useState<any>(null)
  const [citas, setCitas] = useState<any>(null)
  const [pacientes, setPacientes] = useState<any>(null)
  const [ocupacion, setOcupacion] = useState<any>(null)

  const cargar = useCallback(async () => {
    setLoading(true)
    const params = { periodo }
    try {
      if (tab === 'ingresos') {
        const d = await reportesRepository.ingresos(params).catch(() => null)
        setIngresos(d)
      } else if (tab === 'citas') {
        const d = await reportesRepository.citas(params).catch(() => null)
        setCitas(d)
      } else if (tab === 'pacientes') {
        const d = await reportesRepository.pacientes(params).catch(() => null)
        setPacientes(d)
      } else if (tab === 'ocupacion') {
        const d = await reportesRepository.ocupacion(params).catch(() => null)
        setOcupacion(d)
      }
    } finally {
      setLoading(false)
    }
  }, [tab, periodo])

  useEffect(() => {
    cargar()
  }, [cargar])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
          <p className="text-sm text-gray-500 mt-0.5">Análisis del rendimiento de la clínica</p>
        </div>
        {/* Period selector */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {PERIODOS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriodo(p.value)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                periodo === p.value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
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

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {tab === 'ingresos' && <TabIngresos data={ingresos} />}
          {tab === 'citas' && <TabCitas data={citas} />}
          {tab === 'pacientes' && <TabPacientes data={pacientes} />}
          {tab === 'ocupacion' && <TabOcupacion data={ocupacion} />}
        </>
      )}
    </div>
  )
}

function TabIngresos({ data }: { data: any }) {
  if (!data) return <EmptyState />
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard
          label="Total ingresos"
          value={`$${Number(data.total || 0).toFixed(2)}`}
          sub={`${data.cantidad || 0} cobros`}
        />
        <KpiCard
          label="Promedio por cobro"
          value={`$${data.cantidad ? (data.total / data.cantidad).toFixed(2) : '0.00'}`}
        />
        <KpiCard
          label="Método principal"
          value={data.por_metodo?.[0]
            ? METODO_LABELS[data.por_metodo[0].metodo] || data.por_metodo[0].metodo
            : '—'}
        />
        <KpiCard
          label="Servicio principal"
          value={data.por_servicio?.[0]?.servicio || '—'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Tendencia de ingresos</h3>
          {(data.tendencia?.length || 0) === 0 ? (
            <EmptyState />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={data.tendencia}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="fecha" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}`, 'Ingreso']} />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#3b82f6"
                  fill="url(#colorTotal)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Por método de pago</h3>
          {(data.por_metodo?.length || 0) === 0 ? (
            <EmptyState />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={data.por_metodo.map((m: any) => ({
                    name: METODO_LABELS[m.metodo] || m.metodo,
                    value: m.total,
                  }))}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  dataKey="value"
                >
                  {data.por_metodo.map((_: any, i: number) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}`]} />
                <Legend iconType="circle" iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Por servicio</h3>
        {(data.por_servicio?.length || 0) === 0 ? (
          <EmptyState />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.por_servicio} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
              <YAxis type="category" dataKey="servicio" tick={{ fontSize: 11 }} width={120} />
              <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}`, 'Total']} />
              <Bar dataKey="total" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

function TabCitas({ data }: { data: any }) {
  if (!data) return <EmptyState />
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard label="Total citas" value={String(data.total || 0)} />
        <KpiCard label="Canceladas" value={String(data.canceladas || 0)} />
        <KpiCard
          label="Tasa cancelación"
          value={`${data.tasa_cancelacion ?? 0}%`}
        />
        <KpiCard
          label="Completadas"
          value={String(data.por_estado?.find((e: any) => e.estado === 'completada')?.cantidad || 0)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Tendencia de citas</h3>
          {(data.tendencia?.length || 0) === 0 ? (
            <EmptyState />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={data.tendencia}>
                <defs>
                  <linearGradient id="colorCitas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="fecha" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="cantidad"
                  stroke="#10b981"
                  fill="url(#colorCitas)"
                  strokeWidth={2}
                  name="Citas"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Por estado</h3>
          {(data.por_estado?.length || 0) === 0 ? (
            <EmptyState />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={data.por_estado.map((e: any) => ({
                    name: ESTADO_LABELS[e.estado] || e.estado,
                    value: e.cantidad,
                  }))}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  dataKey="value"
                >
                  {data.por_estado.map((_: any, i: number) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Por fisioterapeuta</h3>
        {(data.por_fisioterapeuta?.length || 0) === 0 ? (
          <EmptyState />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.por_fisioterapeuta} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
              <YAxis type="category" dataKey="nombre" tick={{ fontSize: 11 }} width={130} />
              <Tooltip />
              <Bar dataKey="cantidad" fill="#10b981" radius={[0, 4, 4, 0]} name="Citas" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

function TabPacientes({ data }: { data: any }) {
  if (!data) return <EmptyState />
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <KpiCard label="Pacientes activos" value={String(data.total_activos || 0)} />
        <KpiCard label="Nuevos en el período" value={String(data.nuevos_periodo || 0)} />
        <KpiCard
          label="Grupos etarios relevados"
          value={String(
            Object.values(data.grupos_etarios || []).reduce(
              (a: number, g: any) => a + (g.cantidad || 0),
              0
            )
          )}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Nuevos pacientes por mes</h3>
          {(data.nuevos_por_mes?.length || 0) === 0 ? (
            <EmptyState />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.nuevos_por_mes}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="cantidad" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Nuevos pacientes" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Por sexo</h3>
            {(data.por_sexo?.length || 0) === 0 ? (
              <EmptyState />
            ) : (
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie
                    data={data.por_sexo.map((s: any) => ({
                      name: SEXO_LABELS[s.sexo] || s.sexo,
                      value: s.cantidad,
                    }))}
                    cx="50%"
                    cy="50%"
                    outerRadius={55}
                    dataKey="value"
                  >
                    {data.por_sexo.map((_: any, i: number) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend iconType="circle" iconSize={8} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Grupos etarios</h3>
            <div className="space-y-2">
              {(data.grupos_etarios || []).map((g: any) => {
                const total = (data.grupos_etarios || []).reduce(
                  (a: number, x: any) => a + x.cantidad,
                  0
                )
                const pct = total ? Math.round((g.cantidad / total) * 100) : 0
                return (
                  <div key={g.grupo}>
                    <div className="flex justify-between text-xs text-gray-600 mb-0.5">
                      <span>{g.grupo} años</span>
                      <span>{g.cantidad} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function TabOcupacion({ data }: { data: any }) {
  if (!data) return <EmptyState />
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Citas por fisioterapeuta</h3>
          {(data.por_fisioterapeuta?.length || 0) === 0 ? (
            <EmptyState />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.por_fisioterapeuta} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis type="category" dataKey="nombre" tick={{ fontSize: 11 }} width={130} />
                <Tooltip />
                <Bar dataKey="citas" fill="#f59e0b" radius={[0, 4, 4, 0]} name="Citas" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Horas por fisioterapeuta</h3>
          {(data.por_fisioterapeuta?.length || 0) === 0 ? (
            <EmptyState />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.por_fisioterapeuta} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="nombre" tick={{ fontSize: 11 }} width={130} />
                <Tooltip formatter={(v: number) => [`${v}h`, 'Horas']} />
                <Bar dataKey="horas" fill="#06b6d4" radius={[0, 4, 4, 0]} name="Horas" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Citas por servicio</h3>
        {(data.por_servicio?.length || 0) === 0 ? (
          <EmptyState />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.por_servicio}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="servicio" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="cantidad" fill="#ef4444" radius={[4, 4, 0, 0]} name="Citas" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
