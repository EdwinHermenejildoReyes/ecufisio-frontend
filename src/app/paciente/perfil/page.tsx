'use client'

import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { pacientesRepository } from '@/repositories/pacientes'
import { getErrorMessage } from '@/utils/errorMessages'
import { sanitizeTel } from '@/utils/format'
import { logoutUser } from '@/store/auth/slices'
import { LogOut } from 'lucide-react'

const SEXO_CHOICES = [
  { value: '', label: 'Prefiero no indicar' },
  { value: 'M', label: 'Masculino' },
  { value: 'F', label: 'Femenino' },
  { value: 'O', label: 'Otro' },
]

function toList(data: any): any[] {
  if (!data) return []
  return Array.isArray(data) ? data : (data.results || [])
}

export default function PerfilPacientePage() {
  const dispatch = useDispatch()
  const [pacienteId, setPacienteId] = useState<number | null>(null)
  const [form, setForm] = useState<Record<string, string>>({
    nombres: '', apellidos: '', telefono: '',
    cedula: '', fecha_nacimiento: '', sexo: '',
    ocupacion: '', direccion: '',
    contacto_emergencia_nombre: '', contacto_emergencia_telefono: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    pacientesRepository.listar()
      .then(async (data) => {
        const lista = toList(data)
        if (lista.length === 0) return
        const p = lista[0]
        setPacienteId(p.id)
        const detalle = await pacientesRepository.obtener(p.id)
        setForm({
          nombres:                       detalle.user?.nombres               || '',
          apellidos:                     detalle.user?.apellidos             || '',
          telefono:                      detalle.user?.telefono              || '',
          cedula:                        detalle.cedula                      || '',
          fecha_nacimiento:              detalle.fecha_nacimiento            || '',
          sexo:                          detalle.sexo                        || '',
          ocupacion:                     detalle.ocupacion                   || '',
          direccion:                     detalle.direccion                   || '',
          contacto_emergencia_nombre:    detalle.contacto_emergencia_nombre  || '',
          contacto_emergencia_telefono:  detalle.contacto_emergencia_telefono || '',
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pacienteId) return
    setSaving(true)
    setError('')
    setSuccess(false)
    try {
      await pacientesRepository.actualizar(pacienteId, form)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    dispatch(logoutUser())
    window.location.href = '/login'
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-7 h-7 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 py-2">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Mi perfil</h2>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>

      {/* Datos personales */}
      <Section title="Datos personales">
        <Field label="Nombres">
          <input className="input" value={form.nombres} onChange={(e) => setForm({ ...form, nombres: e.target.value })} />
        </Field>
        <Field label="Apellidos">
          <input className="input" value={form.apellidos} onChange={(e) => setForm({ ...form, apellidos: e.target.value })} />
        </Field>
        <Field label="Cédula">
          <input className="input" value={form.cedula} onChange={(e) => setForm({ ...form, cedula: e.target.value })} maxLength={10} />
        </Field>
        <Field label="Fecha de nacimiento">
          <input type="date" className="input" value={form.fecha_nacimiento} onChange={(e) => setForm({ ...form, fecha_nacimiento: e.target.value })} />
        </Field>
        <Field label="Sexo">
          <select className="input" value={form.sexo} onChange={(e) => setForm({ ...form, sexo: e.target.value })}>
            {SEXO_CHOICES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </Field>
        <Field label="Ocupación">
          <input className="input" value={form.ocupacion} onChange={(e) => setForm({ ...form, ocupacion: e.target.value })} />
        </Field>
      </Section>

      {/* Contacto */}
      <Section title="Contacto">
        <Field label="Teléfono">
          <input type="tel" className="input" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: sanitizeTel(e.target.value) })} />
        </Field>
        <Field label="Dirección">
          <textarea className="input resize-none min-h-[64px]" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} />
        </Field>
      </Section>

      {/* Contacto de emergencia */}
      <Section title="Contacto de emergencia">
        <Field label="Nombre">
          <input className="input" value={form.contacto_emergencia_nombre} onChange={(e) => setForm({ ...form, contacto_emergencia_nombre: e.target.value })} />
        </Field>
        <Field label="Teléfono">
          <input type="tel" className="input" value={form.contacto_emergencia_telefono} onChange={(e) => setForm({ ...form, contacto_emergencia_telefono: sanitizeTel(e.target.value) })} />
        </Field>
      </Section>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-emerald-600">✓ Perfil actualizado correctamente.</p>}

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-sky-600 hover:bg-sky-700 text-white py-3 rounded-2xl font-semibold text-sm transition-colors disabled:opacity-60"
      >
        {saving ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </form>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{title}</p>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-gray-600">{label}</label>
      {children}
    </div>
  )
}
