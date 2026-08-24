'use client'

import { useEffect, useState, useCallback } from 'react'
import { ejerciciosRepository } from '@/repositories/ejercicios'
import { CheckCircle2, Circle, ChevronDown, ChevronUp } from 'lucide-react'

const CAT_COLOR: Record<string, string> = {
  fuerza:       'bg-red-100 text-red-700',
  flexibilidad: 'bg-green-100 text-green-700',
  equilibrio:   'bg-blue-100 text-blue-700',
  cardio:       'bg-orange-100 text-orange-700',
  funcional:    'bg-purple-100 text-purple-700',
}
const CAT_LABEL: Record<string, string> = {
  fuerza: 'Fuerza', flexibilidad: 'Flexibilidad', equilibrio: 'Equilibrio',
  cardio: 'Cardio', funcional: 'Funcional',
}

function toList(data: any): any[] {
  if (!data) return []
  return Array.isArray(data) ? data : (data.results || [])
}

const hoy = new Date().toISOString().split('T')[0]

export default function EjerciciosPacientePage() {
  const [rutinas, setRutinas] = useState<any[]>([])
  // adherencia[rutinaId] = { id?, completado }
  const [adherencia, setAdherencia] = useState<Record<number, { id?: number; completado: boolean }>>({})
  const [loading, setLoading] = useState(true)
  const [registrando, setRegistrando] = useState<number | null>(null)
  const [expandidos, setExpandidos] = useState<Set<number>>(new Set())
  const [dolorModal, setDolorModal] = useState<{ rutinaId: number; adherenciaId?: number } | null>(null)
  const [dolorValor, setDolorValor] = useState<number>(0)

  const cargar = useCallback(async () => {
    setLoading(true)
    try {
      const r = toList(await ejerciciosRepository.listarRutina('').catch(() => null))
      setRutinas(r)

      // Cargar adherencia de hoy para cada rutina
      // Hacemos una sola llamada sin filtro y luego cruzamos por fecha
      // (el backend filtra por paciente)
      const adhs: Record<number, { id?: number; completado: boolean }> = {}
      await Promise.all(
        r.map(async (rutina: any) => {
          try {
            const list = toList(await ejerciciosRepository.listarAdherencia(rutina.id))
            const hoyReg = list.find((a: any) => a.fecha === hoy)
            adhs[rutina.id] = hoyReg
              ? { id: hoyReg.id, completado: hoyReg.completado }
              : { completado: false }
          } catch {
            adhs[rutina.id] = { completado: false }
          }
        })
      )
      setAdherencia(adhs)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const toggleCompletado = async (rutinaId: number) => {
    const estado = adherencia[rutinaId]
    if (estado?.completado) return  // Ya completado, no deshacer desde aquí

    setRegistrando(rutinaId)
    try {
      if (estado?.id) {
        await ejerciciosRepository.actualizarAdherencia(estado.id, { completado: true })
        setAdherencia((prev) => ({ ...prev, [rutinaId]: { ...prev[rutinaId], completado: true } }))
      } else {
        const nuevo = await ejerciciosRepository.registrarAdherencia({
          rutina_ejercicio: rutinaId, fecha: hoy, completado: true,
        })
        setAdherencia((prev) => ({ ...prev, [rutinaId]: { id: nuevo.id, completado: true } }))
      }
    } catch {} finally {
      setRegistrando(null)
    }
  }

  const registrarDolor = async () => {
    if (!dolorModal) return
    const { rutinaId, adherenciaId } = dolorModal
    try {
      if (adherenciaId) {
        await ejerciciosRepository.actualizarAdherencia(adherenciaId, { dolor_reportado: dolorValor })
      } else {
        await ejerciciosRepository.registrarAdherencia({
          rutina_ejercicio: rutinaId, fecha: hoy, completado: false, dolor_reportado: dolorValor,
        })
      }
    } catch {} finally {
      setDolorModal(null)
      setDolorValor(0)
    }
  }

  const toggleExpandido = (id: number) =>
    setExpandidos((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const completados = Object.values(adherencia).filter((a) => a.completado).length
  const pendientes = rutinas.length - completados

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-7 h-7 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4 py-2">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Mis ejercicios</h2>
        <p className="text-xs text-gray-400">
          {new Date().toLocaleDateString('es-EC', { weekday: 'long', day: 'numeric', month: 'short' })}
        </p>
      </div>

      {/* Progreso del día */}
      {rutinas.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700">Progreso de hoy</span>
            <span className="text-sky-600 font-semibold">{completados}/{rutinas.length}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-sky-500 rounded-full transition-all duration-500"
              style={{ width: `${rutinas.length ? (completados / rutinas.length) * 100 : 0}%` }}
            />
          </div>
          {pendientes === 0 && rutinas.length > 0 && (
            <p className="text-xs text-emerald-600 font-medium">🎉 ¡Completaste todos tus ejercicios de hoy!</p>
          )}
        </div>
      )}

      {/* Lista de ejercicios */}
      {rutinas.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
          <p className="text-gray-400 text-sm">Tu fisioterapeuta aún no te ha asignado ejercicios.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rutinas.map((r) => {
            const hecho = adherencia[r.id]?.completado
            const expanded = expandidos.has(r.id)
            const isRegistrando = registrando === r.id

            return (
              <div
                key={r.id}
                className={`bg-white rounded-2xl border transition-colors ${
                  hecho ? 'border-emerald-200' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3 p-4">
                  {/* Check button */}
                  <button
                    onClick={() => toggleCompletado(r.id)}
                    disabled={hecho || isRegistrando}
                    className="flex-shrink-0"
                  >
                    {isRegistrando ? (
                      <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
                    ) : hecho ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    ) : (
                      <Circle className="w-6 h-6 text-gray-300 hover:text-sky-400 transition-colors" />
                    )}
                  </button>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium leading-snug ${hecho ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                      {r.ejercicio_nombre}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {r.ejercicio_categoria && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${CAT_COLOR[r.ejercicio_categoria] || 'bg-gray-100 text-gray-500'}`}>
                          {CAT_LABEL[r.ejercicio_categoria] || r.ejercicio_categoria}
                        </span>
                      )}
                      {r.series && r.repeticiones && (
                        <span className="text-[10px] text-gray-400">{r.series} × {r.repeticiones} reps</span>
                      )}
                      {r.duracion_segundos && !r.series && (
                        <span className="text-[10px] text-gray-400">{Math.round(r.duracion_segundos / 60)} min</span>
                      )}
                      {r.descanso_segundos && (
                        <span className="text-[10px] text-gray-400">Descanso: {r.descanso_segundos}s</span>
                      )}
                    </div>
                  </div>

                  {/* Expand */}
                  <button
                    onClick={() => toggleExpandido(r.id)}
                    className="text-gray-300 hover:text-gray-500 flex-shrink-0"
                  >
                    {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {expanded && (
                  <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
                    {r.instrucciones_especificas && (
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Indicaciones</p>
                        <p className="text-xs text-gray-600 mt-0.5">{r.instrucciones_especificas}</p>
                      </div>
                    )}
                    {r.ejercicio_video_url && (
                      <a
                        href={r.ejercicio_video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-sky-600 hover:underline"
                      >
                        ▶ Ver video del ejercicio
                      </a>
                    )}
                    <button
                      onClick={() => setDolorModal({
                        rutinaId: r.id,
                        adherenciaId: adherencia[r.id]?.id,
                      })}
                      className="text-xs text-gray-400 hover:text-gray-600 underline"
                    >
                      Reportar nivel de dolor
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Modal reporte de dolor */}
      {dolorModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">¿Cuánto dolor sientes?</h3>
            <p className="text-xs text-gray-500">Escala del 0 (sin dolor) al 10 (dolor máximo)</p>
            <div className="flex gap-1.5 flex-wrap justify-center">
              {Array.from({ length: 11 }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setDolorValor(i)}
                  className={`w-9 h-9 rounded-xl text-sm font-semibold border transition-colors ${
                    dolorValor === i
                      ? 'bg-sky-600 text-white border-sky-600'
                      : 'border-gray-200 text-gray-600 hover:border-sky-400'
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setDolorModal(null); setDolorValor(0) }}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={registrarDolor}
                className="flex-1 bg-sky-600 text-white py-2.5 rounded-xl text-sm font-medium"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
