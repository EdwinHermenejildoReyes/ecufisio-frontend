'use client'

import { useState, useMemo, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { clearError } from '@/store/auth/slices'
import Link from 'next/link'
import { Activity, Loader2, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react'

/* ── Validación de contraseña ── */
const PASSWORD_RULES = [
  { id: 'length',  label: 'Mínimo 8 caracteres',       test: (p: string) => p.length >= 8 },
  { id: 'upper',   label: 'Una letra mayúscula',        test: (p: string) => /[A-Z]/.test(p) },
  { id: 'lower',   label: 'Una letra minúscula',        test: (p: string) => /[a-z]/.test(p) },
  { id: 'number',  label: 'Un número',                  test: (p: string) => /\d/.test(p) },
]

function PasswordRule({ label, valid }: { label: string; valid: boolean }) {
  return (
    <li className={`flex items-center gap-2 text-xs transition-colors ${valid ? 'text-emerald-600' : 'text-gray-400'}`}>
      <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${valid ? 'text-emerald-500' : 'text-gray-300'}`} />
      {label}
    </li>
  )
}

export default function RegistroPage() {
  const dispatch = useDispatch()
  const { loading, error } = useSelector((state: any) => state.auth)

  useEffect(() => { dispatch(clearError()) }, [dispatch])

  const [form, setForm] = useState({
    nombres: '', apellidos: '', email: '', telefono: '', password: '', re_password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [touched, setTouched] = useState(false)

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }))

  const passwordRules = useMemo(
    () => PASSWORD_RULES.map((r) => ({ ...r, valid: r.test(form.password) })),
    [form.password]
  )
  const passwordOk   = passwordRules.every((r) => r.valid)
  const passwordsMatch = form.password === form.re_password && form.re_password !== ''

  const canSubmit =
    form.nombres.trim() &&
    form.apellidos.trim() &&
    form.email.trim() &&
    passwordOk &&
    passwordsMatch

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)
    if (!canSubmit) return
    dispatch({ type: 'auth/REGISTER_REQUEST', payload: form })
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Panel izquierdo — solo desktop */}
      <div className="hidden lg:flex lg:w-1/2 bg-sky-600 flex-col justify-between p-12 text-white">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <Activity className="w-4 h-4" />
          </div>
          <span className="text-xl font-bold">ecufisio</span>
        </div>

        <div>
          <p className="text-sky-200 text-sm font-semibold uppercase tracking-widest mb-4">
            Período de prueba — 14 días gratis
          </p>
          <h2 className="text-4xl font-bold leading-tight mb-6">
            Moderniza tu clínica desde hoy
          </h2>
          <ul className="space-y-3 text-sky-100">
            {[
              'Agenda y gestión de citas',
              'Expediente clínico digital',
              'Rutinas de ejercicio personalizadas',
              'Notificaciones por WhatsApp',
              'Portal web para pacientes',
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="w-5 h-5 text-sky-300 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-sky-300 text-xs">
          Sin tarjeta de crédito · Cancela cuando quieras
        </p>
      </div>

      {/* Formulario */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <div className="flex items-center justify-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-sky-600 rounded-lg flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold">
              <span className="text-sky-600">ecu</span>fisio
            </span>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="mb-7">
              <h1 className="text-2xl font-bold text-gray-900">Crea tu cuenta</h1>
              <p className="text-gray-500 text-sm mt-1">14 días de prueba gratuita, sin tarjeta.</p>
            </div>

            {/* Error global */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Nombres + Apellidos */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombres <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.nombres}
                    onChange={set('nombres')}
                    placeholder="María"
                    disabled={loading}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Apellidos <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.apellidos}
                    onChange={set('apellidos')}
                    placeholder="García"
                    disabled={loading}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-50"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correo electrónico <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  placeholder="maria@clinica.com"
                  disabled={loading}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-50"
                />
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono / WhatsApp
                  <span className="text-gray-400 font-normal ml-1">(opcional)</span>
                </label>
                <input
                  type="tel"
                  value={form.telefono}
                  onChange={set('telefono')}
                  placeholder="+593 99 999 9999"
                  disabled={loading}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-50"
                />
              </div>

              {/* Contraseña */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={set('password')}
                    placeholder="••••••••"
                    disabled={loading}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Reglas de contraseña */}
                {form.password && (
                  <ul className="mt-2 space-y-1 pl-1">
                    {passwordRules.map((r) => (
                      <PasswordRule key={r.id} label={r.label} valid={r.valid} />
                    ))}
                  </ul>
                )}
              </div>

              {/* Confirmar contraseña */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar contraseña <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={form.re_password}
                    onChange={set('re_password')}
                    placeholder="••••••••"
                    disabled={loading}
                    className={`w-full border rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:border-transparent disabled:opacity-50 disabled:bg-gray-50 ${
                      touched && form.re_password && !passwordsMatch
                        ? 'border-red-300 focus:ring-red-400'
                        : 'border-gray-200 focus:ring-sky-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {touched && form.re_password && !passwordsMatch && (
                  <p className="text-xs text-red-500 mt-1">Las contraseñas no coinciden</p>
                )}
                {form.re_password && passwordsMatch && (
                  <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Las contraseñas coinciden
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white py-3 rounded-xl font-semibold transition-all hover:scale-[1.01] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creando cuenta...
                  </>
                ) : (
                  'Comenzar período de prueba'
                )}
              </button>

              <p className="text-xs text-gray-400 text-center leading-relaxed">
                Al registrarte aceptas nuestros{' '}
                <Link href="/terminos" className="text-sky-600 hover:underline">Términos de servicio</Link>
                {' '}y{' '}
                <Link href="/privacidad" className="text-sky-600 hover:underline">Política de privacidad</Link>.
              </p>
            </form>
          </div>

          <p className="text-center text-sm text-gray-500 mt-5">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-sky-600 hover:underline font-medium">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
