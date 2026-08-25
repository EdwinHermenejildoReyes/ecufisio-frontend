'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Activity, ChevronLeft, ChevronRight, Check, Clock, Calendar, User, AlertCircle, Loader2 } from 'lucide-react'
import { reservasRepository } from '@/repositories/reservas'
import { sanitizeTel } from '@/utils/format'

// ─── Types ───────────────────────────────────────────────────────────────────

type Fisio = {
  id: number
  nombre_completo: string
  foto: string | null
  dias_disponibles: number[]
}

type Servicio = {
  id: number
  nombre: string
  descripcion: string
  duracion_minutos: number
  precio: string
  color: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

function isoDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function addMonths(d: Date, n: number) {
  const r = new Date(d)
  r.setDate(1)
  r.setMonth(r.getMonth() + n)
  return r
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

// ─── Stepper ─────────────────────────────────────────────────────────────────

const STEPS = ['Servicio', 'Fecha', 'Hora', 'Datos']

function Stepper({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
              i < current ? 'bg-sky-600 text-white' :
              i === current ? 'bg-sky-600 text-white ring-4 ring-sky-100' :
              'bg-gray-100 text-gray-400'
            }`}>
              {i < current ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`text-xs mt-1 font-medium ${i <= current ? 'text-sky-600' : 'text-gray-400'}`}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`w-12 sm:w-20 h-0.5 mb-5 mx-1 transition-colors ${i < current ? 'bg-sky-600' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Paso 1: Servicio ─────────────────────────────────────────────────────────

function PasoServicio({
  servicios, selected, onSelect,
}: { servicios: Servicio[]; selected: Servicio | null; onSelect: (s: Servicio) => void }) {
  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-4">¿Qué servicio necesitas?</h2>
      <div className="space-y-3">
        {servicios.map((s) => (
          <button
            key={s.id}
            onClick={() => onSelect(s)}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
              selected?.id === s.id
                ? 'border-sky-500 bg-sky-50'
                : 'border-gray-200 hover:border-sky-200 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: s.color || '#0ea5e9' }}
                />
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{s.nombre}</p>
                  {s.descripcion && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{s.descripcion}</p>
                  )}
                </div>
              </div>
              <div className="text-right shrink-0 ml-4">
                <p className="text-sm font-bold text-sky-700">${s.precio}</p>
                <p className="text-xs text-gray-400 flex items-center gap-1 justify-end">
                  <Clock className="w-3 h-3" />{s.duracion_minutos} min
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Paso 2: Fecha ────────────────────────────────────────────────────────────

function PasoFecha({
  diasDisponibles, selected, onSelect,
}: { diasDisponibles: number[]; selected: Date | null; onSelect: (d: Date) => void }) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const [viewMonth, setViewMonth] = useState(startOfMonth(today))

  const firstDay = startOfMonth(viewMonth)
  const offset = (firstDay.getDay() + 6) % 7 // lunes = 0
  const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate()

  const canPrev = viewMonth > startOfMonth(today)

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-4">Elige una fecha</h2>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {/* Cabecera mes */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <button
            onClick={() => setViewMonth(addMonths(viewMonth, -1))}
            disabled={!canPrev}
            className="p-1 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-semibold text-gray-800 text-sm">
            {MESES[viewMonth.getMonth()]} {viewMonth.getFullYear()}
          </span>
          <button
            onClick={() => setViewMonth(addMonths(viewMonth, 1))}
            className="p-1 rounded-lg hover:bg-gray-100"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Días semana */}
        <div className="grid grid-cols-7 border-b border-gray-100">
          {DIAS.map((d) => (
            <div key={d} className="text-center text-xs font-medium text-gray-400 py-2">{d}</div>
          ))}
        </div>

        {/* Días */}
        <div className="grid grid-cols-7 p-2 gap-1">
          {Array.from({ length: offset }).map((_, i) => (
            <div key={`e-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), i + 1)
            const weekday = (day.getDay() + 6) % 7 // lunes=0
            const available = diasDisponibles.includes(weekday)
            const isPast = day < today
            const isSelected = selected && isoDate(day) === isoDate(selected)
            const isToday = isoDate(day) === isoDate(today)

            return (
              <button
                key={i}
                disabled={!available || isPast}
                onClick={() => onSelect(day)}
                className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                  isSelected
                    ? 'bg-sky-600 text-white'
                    : available && !isPast
                    ? 'text-gray-900 hover:bg-sky-50 hover:text-sky-700 ' + (isToday ? 'ring-1 ring-sky-400' : '')
                    : 'text-gray-300 cursor-not-allowed'
                }`}
              >
                {i + 1}
              </button>
            )
          })}
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-2 text-center">
        Solo se muestran los días en que el fisioterapeuta tiene disponibilidad.
      </p>
    </div>
  )
}

// ─── Paso 3: Hora ─────────────────────────────────────────────────────────────

function PasoHora({
  slots, loading, selected, onSelect, fecha,
}: {
  slots: string[]; loading: boolean; selected: string | null;
  onSelect: (h: string) => void; fecha: Date | null
}) {
  if (loading) return (
    <div className="flex flex-col items-center py-12 gap-3">
      <Loader2 className="w-6 h-6 animate-spin text-sky-500" />
      <p className="text-sm text-gray-500">Consultando disponibilidad…</p>
    </div>
  )

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-1">Elige un horario</h2>
      {fecha && (
        <p className="text-sm text-gray-500 mb-4 flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          {fecha.toLocaleDateString('es-EC', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      )}
      {slots.length === 0 ? (
        <div className="text-center py-10">
          <Clock className="w-10 h-10 text-gray-200 mx-auto mb-2" />
          <p className="text-sm text-gray-400">No hay horarios disponibles para este día.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {slots.map((slot) => (
            <button
              key={slot}
              onClick={() => onSelect(slot)}
              className={`py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                selected === slot
                  ? 'border-sky-500 bg-sky-600 text-white'
                  : 'border-gray-200 text-gray-700 hover:border-sky-300 hover:bg-sky-50'
              }`}
            >
              {slot}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Paso 4: Datos personales ─────────────────────────────────────────────────

type FormData = { nombres: string; apellidos: string; email: string; telefono: string; notas: string }

function PasoDatos({
  form, setForm, onSubmit, saving, error,
}: {
  form: FormData; setForm: (f: FormData) => void;
  onSubmit: () => void; saving: boolean; error: string | null
}) {
  const set = (k: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value })

  const INPUT = 'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent'

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-4">Tus datos</h2>
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Nombres *</label>
            <input className={INPUT} value={form.nombres} onChange={set('nombres')} placeholder="María" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Apellidos *</label>
            <input className={INPUT} value={form.apellidos} onChange={set('apellidos')} placeholder="García" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Correo electrónico *</label>
          <input className={INPUT} type="email" value={form.email} onChange={set('email')} placeholder="maria@email.com" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Teléfono / WhatsApp</label>
          <input className={INPUT} type="tel" maxLength={15} value={form.telefono} onChange={(e) => setForm({ ...form, telefono: sanitizeTel(e.target.value) })} placeholder="+593 99 999 9999" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Motivo de consulta</label>
          <textarea
            className={`${INPUT} resize-none`}
            rows={3}
            value={form.notas}
            onChange={set('notas')}
            placeholder="Describe brevemente tu motivo de consulta…"
          />
        </div>
      </div>

      <button
        onClick={onSubmit}
        disabled={saving || !form.nombres || !form.apellidos || !form.email}
        className="mt-6 w-full flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white py-3 rounded-xl font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Confirmando…</> : 'Confirmar reserva'}
      </button>
    </div>
  )
}

// ─── Confirmación ─────────────────────────────────────────────────────────────

function Confirmacion({ fisio, servicio, fecha, hora }: {
  fisio: Fisio; servicio: Servicio; fecha: Date; hora: string
}) {
  return (
    <div className="text-center py-4">
      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Check className="w-8 h-8 text-emerald-600" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">¡Reserva confirmada!</h2>
      <p className="text-sm text-gray-500 mb-6">Te esperamos en la clínica.</p>

      <div className="bg-gray-50 rounded-xl p-5 text-left space-y-3">
        <Row icon={<User className="w-4 h-4" />} label="Fisioterapeuta" value={fisio.nombre_completo} />
        <Row icon={<Activity className="w-4 h-4" />} label="Servicio" value={servicio.nombre} />
        <Row
          icon={<Calendar className="w-4 h-4" />}
          label="Fecha"
          value={fecha.toLocaleDateString('es-EC', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        />
        <Row icon={<Clock className="w-4 h-4" />} label="Hora" value={hora} />
      </div>
    </div>
  )
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-sky-500 mt-0.5 shrink-0">{icon}</span>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-semibold text-gray-800 capitalize">{value}</p>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReservarPage() {
  const { id } = useParams<{ id: string }>()

  const [fisio, setFisio] = useState<Fisio | null>(null)
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [loadingInit, setLoadingInit] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [step, setStep] = useState(0)
  const [servicio, setServicio] = useState<Servicio | null>(null)
  const [fecha, setFecha] = useState<Date | null>(null)
  const [slots, setSlots] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [hora, setHora] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>({ nombres: '', apellidos: '', email: '', telefono: '', notas: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    Promise.all([
      reservasRepository.obtenerFisioterapeuta(id),
      reservasRepository.listarServicios(),
    ])
      .then(([f, s]) => { setFisio(f); setServicios(s) })
      .catch(() => setNotFound(true))
      .finally(() => setLoadingInit(false))
  }, [id])

  const cargarSlots = useCallback((f: Date, s: Servicio) => {
    setLoadingSlots(true)
    setSlots([])
    setHora(null)
    reservasRepository.obtenerSlots(id, isoDate(f), String(s.id))
      .then(setSlots)
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false))
  }, [id])

  const handleSelectFecha = (d: Date) => {
    setFecha(d)
    setHora(null)
    if (servicio) cargarSlots(d, servicio)
  }

  const handleSelectServicio = (s: Servicio) => {
    setServicio(s)
    if (fecha) cargarSlots(fecha, s)
  }

  const handleSubmit = async () => {
    if (!fisio || !servicio || !fecha || !hora) return
    setError(null)
    setSaving(true)

    const [h, m] = hora.split(':')
    const fechaHora = new Date(fecha)
    fechaHora.setHours(Number(h), Number(m), 0, 0)

    try {
      await reservasRepository.crearReserva({
        nombres: form.nombres,
        apellidos: form.apellidos,
        email: form.email,
        telefono: form.telefono,
        notas: form.notas,
        fisioterapeuta: fisio.id,
        servicio: servicio.id,
        fecha_hora: fechaHora.toISOString(),
      })
      setDone(true)
    } catch (e: any) {
      const msg = e?.response?.data?.detail || 'No se pudo confirmar la reserva. Intenta de nuevo.'
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  const canNext = [
    !!servicio,
    !!fecha,
    !!hora,
    !!(form.nombres && form.apellidos && form.email),
  ]

  if (loadingInit) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
    </div>
  )

  if (notFound) return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-5xl font-bold text-gray-200 mb-3">404</p>
        <p className="text-gray-500">Este link de reserva no existe o fue desactivado.</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-2">
        <div className="w-7 h-7 bg-sky-600 rounded-lg flex items-center justify-center">
          <Activity className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-gray-800">
          <span className="text-sky-600">ecu</span>fisio
        </span>
        {fisio && (
          <>
            <span className="text-gray-300 mx-1">·</span>
            <span className="text-sm text-gray-500">{fisio.nombre_completo}</span>
          </>
        )}
      </header>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {done && fisio && servicio && fecha && hora ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <Confirmacion fisio={fisio} servicio={servicio} fecha={fecha} hora={hora} />
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <Stepper current={step} />

              {step === 0 && (
                <PasoServicio servicios={servicios} selected={servicio} onSelect={handleSelectServicio} />
              )}
              {step === 1 && fisio && (
                <PasoFecha
                  diasDisponibles={fisio.dias_disponibles}
                  selected={fecha}
                  onSelect={handleSelectFecha}
                />
              )}
              {step === 2 && (
                <PasoHora slots={slots} loading={loadingSlots} selected={hora} onSelect={setHora} fecha={fecha} />
              )}
              {step === 3 && (
                <PasoDatos form={form} setForm={setForm} onSubmit={handleSubmit} saving={saving} error={error} />
              )}

              {/* Navigation */}
              {step < 3 && (
                <div className="flex justify-between mt-6 pt-5 border-t border-gray-100">
                  <button
                    onClick={() => setStep(step - 1)}
                    disabled={step === 0}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 disabled:opacity-0 disabled:pointer-events-none"
                  >
                    <ChevronLeft className="w-4 h-4" /> Atrás
                  </button>
                  <button
                    onClick={() => setStep(step + 1)}
                    disabled={!canNext[step]}
                    className="flex items-center gap-1 bg-sky-600 hover:bg-sky-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {step === 2 ? 'Continuar' : 'Siguiente'} <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
