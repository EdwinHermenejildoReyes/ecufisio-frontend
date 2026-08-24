'use client'

import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import Link from 'next/link'
import { agendaRepository } from '@/repositories/agenda'
import { pacientesRepository } from '@/repositories/pacientes'
import { ejerciciosRepository } from '@/repositories/ejercicios'
import { Calendar, Dumbbell, ChevronRight, Package } from 'lucide-react'

const ESTADO_LABEL: Record<string, string> = {
  pendiente: 'Pendiente', confirmada: 'Confirmada',
  en_curso: 'En curso', completada: 'Completada',
  cancelada: 'Cancelada', no_asistio: 'No asistió',
}
const ESTADO_COLOR: Record<string, string> = {
  pendiente: 'bg-amber-100 text-amber-700',
  confirmada: 'bg-sky-100 text-sky-700',
  en_curso: 'bg-emerald-100 text-emerald-700',
  completada: 'bg-gray-100 text-gray-500',
  cancelada: 'bg-red-100 text-red-600',
  no_asistio: 'bg-red-100 text-red-600',
}

function toList(data: any): any[] {
  if (!data) return []
  if (Array.isArray(data)) return data
  return data.results || []
}

export default function PacienteHome() {
  const { user } = useSelector((s: any) => s.auth)
  const [proximaCita, setProximaCita] = useState<any>(null)
  const [paqueteActivo, setPaqueteActivo] = useState<any>(null)
  const [ejerciciosPendientes, setEjerciciosPendientes] = useState(0)
  const [loading, setLoading] = useState(true)

  const today = new Date().toISOString().split('T')[0]
  const hora = new Date().getHours()
  const saludo = hora < 12 ? 'Buenos días' : hora < 18 ? 'Buenas tardes' : 'Buenas noches'

  useEffect(() => {
    const load = async () => {
      try {
        // Próxima cita
        const citas = await agendaRepository.listarCitas({ ordering: 'fecha_hora' }).catch(() => null)
        const lista = toList(citas)
        const proxima = lista.find((c: any) =>
          ['pendiente', 'confirmada'].includes(c.estado) &&
          new Date(c.fecha_hora) >= new Date()
        )
        setProximaCita(proxima || null)

        // Paquete activo (via pacientes list → paquetes)
        const perfil = toList(await pacientesRepository.listar().catch(() => null))
        if (perfil.length > 0) {
          const paquetes = await pacientesRepository.paquetes(perfil[0].id).catch(() => null)
          const activo = toList(paquetes).find((p: any) => p.estado === 'activo')
          setPaqueteActivo(activo || null)
        }

        // Ejercicios pendientes hoy
        const rutinas = toList(await ejerciciosRepository.listarRutina('').catch(() => null))
        const adherenciaHoy = toList(
          await ejerciciosRepository.listarAdherencia('').then((d: any) => {
            // filter by date client-side since we can't pass fecha without rutina_id
            const list = toList(d)
            return list.filter((a: any) => a.fecha === today && a.completado)
          }).catch(() => null)
        )
        const completadosIds = new Set(adherenciaHoy.map((a: any) => a.rutina_ejercicio))
        setEjerciciosPendientes(rutinas.filter((r: any) => !completadosIds.has(r.id)).length)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [today])

  return (
    <div className="space-y-4 py-2">
      {/* Saludo */}
      <div className="pt-1">
        <p className="text-gray-500 text-sm">{saludo}</p>
        <h2 className="text-xl font-bold text-gray-900">
          {user?.nombres || 'Paciente'} 👋
        </h2>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-7 h-7 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Próxima cita */}
          <section>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Próxima cita
            </p>
            {proximaCita ? (
              <Link href="/paciente/citas" className="block">
                <div className="bg-sky-600 text-white rounded-2xl p-5 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-lg">
                        {new Date(proximaCita.fecha_hora).toLocaleDateString('es-EC', {
                          weekday: 'long', day: 'numeric', month: 'long',
                        })}
                      </p>
                      <p className="text-sky-100 text-sm mt-0.5">
                        {new Date(proximaCita.fecha_hora).toLocaleTimeString('es-EC', {
                          hour: '2-digit', minute: '2-digit',
                        })}
                        {' · '}{proximaCita.servicio_nombre}
                      </p>
                      {proximaCita.fisioterapeuta_nombre && (
                        <p className="text-sky-200 text-xs mt-1">
                          Con {proximaCita.fisioterapeuta_nombre}
                        </p>
                      )}
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      proximaCita.estado === 'confirmada'
                        ? 'bg-white/20 text-white'
                        : 'bg-amber-400/30 text-amber-100'
                    }`}>
                      {ESTADO_LABEL[proximaCita.estado] || proximaCita.estado}
                    </span>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="bg-white rounded-2xl p-5 border border-gray-200 text-center text-sm text-gray-400">
                No tienes citas próximas programadas.
              </div>
            )}
          </section>

          {/* Tarjetas de acceso rápido */}
          <section className="grid grid-cols-2 gap-3">
            <Link href="/paciente/ejercicios">
              <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col gap-3 hover:shadow-sm transition-shadow">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Dumbbell className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{ejerciciosPendientes}</p>
                  <p className="text-xs text-gray-500 leading-tight">
                    ejercicio{ejerciciosPendientes !== 1 ? 's' : ''} pendiente{ejerciciosPendientes !== 1 ? 's' : ''} hoy
                  </p>
                </div>
              </div>
            </Link>

            {paqueteActivo ? (
              <Link href="/paciente/citas">
                <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col gap-3 hover:shadow-sm transition-shadow">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Package className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {paqueteActivo.sesiones_disponibles ?? '—'}
                    </p>
                    <p className="text-xs text-gray-500 leading-tight">
                      sesiones disponibles en tu paquete
                    </p>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full"
                      style={{
                        width: `${((paqueteActivo.sesiones_usadas || 0) / (paqueteActivo.total_sesiones || 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </Link>
            ) : (
              <Link href="/paciente/citas">
                <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col gap-3 hover:shadow-sm transition-shadow">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Mis citas</p>
                    <p className="text-xs text-gray-500">Ver historial y próximas</p>
                  </div>
                </div>
              </Link>
            )}
          </section>

          {/* Accesos directos */}
          <section className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
            {[
              { href: '/paciente/historial', label: 'Ver mi historial clínico', sub: 'Sesiones y diagnósticos' },
              { href: '/paciente/perfil',    label: 'Editar mi perfil',          sub: 'Datos personales y contacto' },
            ].map(({ href, label, sub }) => (
              <Link key={href} href={href} className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{label}</p>
                  <p className="text-xs text-gray-400">{sub}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </Link>
            ))}
          </section>
        </>
      )}
    </div>
  )
}
