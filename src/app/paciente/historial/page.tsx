'use client'

import { useEffect, useState } from 'react'
import { expedienteRepository } from '@/repositories/expediente'
import { ChevronDown, ChevronUp } from 'lucide-react'

function toList(data: any): any[] {
  if (!data) return []
  return Array.isArray(data) ? data : (data.results || [])
}

function DolorBadge({ inicio, fin }: { inicio?: number; fin?: number }) {
  if (inicio == null) return null
  const delta = fin != null ? fin - inicio : null
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-gray-500">Dolor:</span>
      <span className={`font-semibold ${inicio >= 7 ? 'text-red-500' : inicio >= 4 ? 'text-amber-500' : 'text-emerald-500'}`}>
        {inicio}/10
      </span>
      {fin != null && (
        <>
          <span className="text-gray-300">→</span>
          <span className={`font-semibold ${fin >= 7 ? 'text-red-500' : fin >= 4 ? 'text-amber-500' : 'text-emerald-500'}`}>
            {fin}/10
          </span>
          {delta !== null && delta < 0 && (
            <span className="text-emerald-600 font-medium">↓ {Math.abs(delta)} pts</span>
          )}
        </>
      )}
    </div>
  )
}

export default function HistorialPacientePage() {
  const [sesiones, setSesiones] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expandidas, setExpandidas] = useState<Set<number>>(new Set())

  useEffect(() => {
    expedienteRepository.listarSesiones({ ordering: '-created_at' })
      .then((d) => setSesiones(toList(d)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const toggle = (id: number) =>
    setExpandidas((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-7 h-7 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4 py-2">
      <h2 className="text-lg font-bold text-gray-900">Historial clínico</h2>

      {sesiones.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-sm text-gray-400">
          Aún no tienes sesiones registradas.
        </div>
      ) : (
        <div className="space-y-3">
          {sesiones.map((s) => {
            const exp = expandidas.has(s.id)
            const fechaCita = s.cita?.fecha_hora
              ? new Date(s.cita.fecha_hora).toLocaleDateString('es-EC', {
                  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                })
              : '—'

            return (
              <div key={s.id} className="bg-white rounded-2xl border border-gray-200">
                <button
                  onClick={() => toggle(s.id)}
                  className="w-full flex items-center gap-3 p-4 text-left"
                >
                  {/* Indicador color */}
                  <div className="w-1 self-stretch rounded-full bg-sky-400 flex-shrink-0" />

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 capitalize">{fechaCita}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {s.cita?.servicio_nombre || 'Sesión de fisioterapia'}
                      {s.cita?.fisioterapeuta_nombre && ` · ${s.cita.fisioterapeuta_nombre}`}
                    </p>
                    {s.diagnostico_cie10 && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        CIE-10: {s.diagnostico_cie10}
                      </p>
                    )}
                  </div>

                  <div className="flex-shrink-0 text-gray-300">
                    {exp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {exp && (
                  <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
                    <DolorBadge inicio={s.escala_dolor_inicio} fin={s.escala_dolor_fin} />

                    {s.motivo_consulta && (
                      <InfoBlock label="Motivo de consulta" text={s.motivo_consulta} />
                    )}
                    {s.diagnostico_descripcion && (
                      <InfoBlock label="Diagnóstico" text={s.diagnostico_descripcion} />
                    )}
                    {s.tratamiento_realizado && (
                      <InfoBlock label="Tratamiento realizado" text={s.tratamiento_realizado} />
                    )}
                    {s.observaciones && (
                      <InfoBlock label="Observaciones" text={s.observaciones} />
                    )}
                    {s.proxima_sesion_recomendada && (
                      <InfoBlock label="Recomendación próxima sesión" text={s.proxima_sesion_recomendada} />
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function InfoBlock({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-xs text-gray-700 mt-0.5 leading-relaxed">{text}</p>
    </div>
  )
}
