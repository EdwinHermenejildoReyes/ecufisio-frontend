'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import {
  Calendar,
  ClipboardList,
  Bell,
  Smartphone,
  Shield,
  Globe,
  Users,
  CheckCircle,
  ArrowRight,
  Menu,
  X,
  Heart,
  Activity,
  Zap,
} from 'lucide-react'

const FEATURES = [
  {
    icon: Calendar,
    title: 'Agenda Inteligente',
    description:
      'Gestiona citas, disponibilidad de fisioterapeutas y salas en un calendario visual. Evita solapamientos y optimiza cada horario.',
  },
  {
    icon: ClipboardList,
    title: 'Expediente Clínico',
    description:
      'Registra sesiones, evaluaciones posturales, diagnósticos CIE-10 y la evolución de cada paciente en un solo lugar.',
  },
  {
    icon: Activity,
    title: 'Rutinas de Ejercicio',
    description:
      'Prescribe rutinas personalizadas y monitorea la adherencia de tus pacientes. Haz seguimiento del dolor reportado sesión a sesión.',
  },
  {
    icon: Bell,
    title: 'Recordatorios WhatsApp',
    description:
      'Envía recordatorios automáticos de citas por WhatsApp 24 horas antes. Reduce inasistencias y mejora la experiencia del paciente.',
  },
  {
    icon: Smartphone,
    title: 'Portal del Paciente',
    description:
      'Tus pacientes acceden a sus citas, consentimientos y rutinas desde cualquier dispositivo. PWA instalable, sin app store.',
  },
]

const WHO_CARDS = [
  {
    icon: Users,
    role: 'Administradores',
    description:
      'Control total: gestión de staff, reportes financieros, configuración de servicios y visión global de la clínica.',
  },
  {
    icon: Activity,
    role: 'Fisioterapeutas',
    description:
      'Agenda personalizada, acceso al expediente clínico de sus pacientes y herramientas para prescribir rutinas de ejercicio.',
  },
  {
    icon: Smartphone,
    role: 'Pacientes',
    description:
      'Portal web para consultar citas, firmar consentimientos, ver sus rutinas y reportar adherencia desde el celular.',
  },
]

const ECUADOR_CARDS = [
  {
    icon: Shield,
    title: 'Datos seguros',
    description:
      'Almacenamiento seguro, backups automáticos y acceso protegido con JWT. Diseñado bajo las normativas de salud locales.',
  },
  {
    icon: Zap,
    title: 'Listo para usar',
    description:
      'Sin instalaciones, sin servidores propios. Accede desde cualquier navegador con internet. Configuración en minutos.',
  },
]

const PLANS = [
  {
    name: 'Básico',
    price: 25,
    description: 'Para clínicas unipersonales que empiezan su digitalización.',
    features: [
      '1 fisioterapeuta',
      'Hasta 200 citas al mes',
      'Agenda y calendario',
      'Expediente clínico',
      'Portal del paciente',
      'Soporte por email',
    ],
    highlighted: false,
    cta: 'Comenzar gratis',
  },
  {
    name: 'Profesional',
    price: 49,
    description: 'Para clínicas en crecimiento que necesitan más herramientas.',
    features: [
      'Hasta 5 fisioterapeutas',
      'Citas ilimitadas',
      'Notificaciones WhatsApp',
      'Rutinas de ejercicio',
      'Consentimientos digitales',
      'Soporte prioritario',
    ],
    highlighted: true,
    cta: 'Comenzar gratis',
  },
  {
    name: 'Clínica',
    price: 89,
    description: 'Para centros con múltiples profesionales y alta demanda.',
    features: [
      'Fisioterapeutas ilimitados',
      'Múltiples salas',
      'Paquetes de sesiones',
      'Estadísticas avanzadas',
      'Todo el plan Profesional',
      'Soporte 24/7',
    ],
    highlighted: false,
    cta: 'Contactar ventas',
  },
]

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* ═══ NAVBAR ═══ */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-sky-600 rounded-lg flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold">
              <span className="text-sky-600">Fisio</span>Core
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#funcionalidades" className="hover:text-sky-600 transition-colors">Funcionalidades</a>
            <a href="#precios" className="hover:text-sky-600 transition-colors">Precios</a>
            <a href="#contacto" className="hover:text-sky-600 transition-colors">Contacto</a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-sky-600 transition-colors px-4 py-2"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/registro"
              className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              Comenzar gratis
            </Link>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Menú"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-1">
            <a href="#funcionalidades" onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-gray-700 px-2 py-2.5 rounded-lg hover:bg-gray-50">Funcionalidades</a>
            <a href="#precios" onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-gray-700 px-2 py-2.5 rounded-lg hover:bg-gray-50">Precios</a>
            <a href="#contacto" onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-gray-700 px-2 py-2.5 rounded-lg hover:bg-gray-50">Contacto</a>
            <hr className="border-gray-100 my-2" />
            <Link href="/login" className="block text-sm font-medium text-gray-700 px-2 py-2.5 rounded-lg hover:bg-gray-50">Iniciar sesión</Link>
            <Link href="/registro" className="block bg-sky-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold text-center mt-2">Comenzar gratis</Link>
          </div>
        )}
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="relative pt-16 h-screen flex items-center overflow-hidden">
        {/* Imagen de fondo completa */}
        <Image
          src="/fondo-hero.png"
          alt=""
          fill
          className="object-cover object-center"
          priority
        />

        {/* Texto */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-xl lg:max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm border border-sky-100 text-sky-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Globe className="w-4 h-4" />
              Diseñado para clínicas de fisioterapia en Ecuador
            </div>

            <h1 className="text-5xl sm:text-6xl xl:text-7xl font-bold leading-tight mb-6 text-gray-900">
              Gestiona tu clínica{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-cyan-500">
                con facilidad
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed">
              Agenda, expedientes clínicos, rutinas de ejercicio y comunicación con pacientes.
              Todo en una plataforma pensada para Ecuador.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link
                href="/registro"
                className="inline-flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-8 py-4 rounded-xl text-lg font-bold transition-all hover:scale-105 shadow-lg shadow-sky-600/20"
              >
                Comenzar gratis
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#funcionalidades"
                className="inline-flex items-center justify-center gap-2 bg-white/80 backdrop-blur-sm hover:bg-white text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold transition-all border border-gray-200 shadow-sm"
              >
                Ver funcionalidades
              </a>
            </div>

            <div className="grid grid-cols-3 gap-8 max-w-sm">
              <div>
                <p className="text-3xl font-bold text-sky-600">100%</p>
                <p className="text-xs text-gray-500 mt-1">Web, sin instalar</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-sky-600">PWA</p>
                <p className="text-xs text-gray-500 mt-1">Portal del paciente</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-sky-600">24/7</p>
                <p className="text-xs text-gray-500 mt-1">Acceso online</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FUNCIONALIDADES ═══ */}
      <section id="funcionalidades" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <span className="text-sky-600 text-sm font-semibold uppercase tracking-widest">Funcionalidades</span>
            <h2 className="text-4xl sm:text-5xl font-bold mt-3 text-gray-900">
              Todo lo que necesita{' '}
              <span className="text-sky-600">tu clínica</span>
            </h2>
            <p className="text-gray-500 mt-4 max-w-xl mx-auto leading-relaxed">
              Herramientas específicas para el flujo de trabajo de una clínica de fisioterapia.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] bg-white border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-md hover:border-sky-100 transition-all group"
              >
                <div className="w-12 h-12 bg-sky-50 group-hover:bg-sky-100 rounded-xl flex items-center justify-center mb-5 transition-colors">
                  <f.icon className="w-6 h-6 text-sky-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PARA QUIÉN ═══ */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <span className="text-sky-600 text-sm font-semibold uppercase tracking-widest">Para cada rol</span>
            <h2 className="text-4xl sm:text-5xl font-bold mt-3 text-gray-900">
              Una herramienta para{' '}
              <span className="text-sky-600">todo tu equipo</span>
            </h2>
            <p className="text-gray-500 mt-4 max-w-xl mx-auto leading-relaxed">
              Administradores, fisioterapeutas y pacientes, cada uno con su propio espacio.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {WHO_CARDS.map((card) => (
              <div
                key={card.role}
                className="bg-white border border-gray-100 rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition-all"
              >
                <div className="w-14 h-14 bg-sky-50 rounded-xl flex items-center justify-center mx-auto mb-5">
                  <card.icon className="w-7 h-7 text-sky-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{card.role}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HECHO PARA ECUADOR ═══ */}
      <section className="py-24 bg-sky-600">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <span className="text-sky-200 text-sm font-semibold uppercase tracking-widest">Diferencial</span>
            <h2 className="text-4xl sm:text-5xl font-bold mt-3 text-white">
              Hecho para Ecuador
            </h2>
            <p className="text-sky-100 mt-4 max-w-xl mx-auto leading-relaxed">
              No es un software genérico adaptado. Fue construido desde cero pensando en el
              sistema de salud y la normativa tributaria ecuatoriana.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-8">
            {ECUADOR_CARDS.map((item) => (
              <div key={item.title} className="w-full md:w-[calc(33.333%-22px)] bg-white/10 border border-white/20 rounded-2xl p-8 text-center backdrop-blur-sm">
                <div className="w-14 h-14 bg-white/15 rounded-xl flex items-center justify-center mx-auto mb-5">
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-sky-100 leading-relaxed text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PRECIOS ═══ */}
      <section id="precios" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <span className="text-sky-600 text-sm font-semibold uppercase tracking-widest">Precios</span>
            <h2 className="text-4xl sm:text-5xl font-bold mt-3 text-gray-900">
              Planes para cada{' '}
              <span className="text-sky-600">tipo de clínica</span>
            </h2>
            <p className="text-gray-500 mt-4">
              Todos los planes incluyen 14 días de prueba gratuita. Sin tarjeta de crédito.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-start">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 border flex flex-col transition-all ${
                  plan.highlighted
                    ? 'bg-sky-600 border-sky-600 shadow-xl shadow-sky-600/25 md:-mt-4 md:-mb-4'
                    : 'bg-white border-gray-100 shadow-sm'
                }`}
              >
                {plan.highlighted && (
                  <div className="text-sky-200 text-xs font-bold uppercase tracking-widest mb-3">Más popular</div>
                )}
                <h3 className={`text-2xl font-bold mb-1 ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mb-6 ${plan.highlighted ? 'text-sky-100' : 'text-gray-500'}`}>
                  {plan.description}
                </p>
                <div className="mb-8">
                  <span className={`text-5xl font-bold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                    ${plan.price}
                  </span>
                  <span className={`text-sm ml-1 ${plan.highlighted ? 'text-sky-100' : 'text-gray-400'}`}>/mes</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-3">
                      <CheckCircle
                        className={`w-5 h-5 shrink-0 ${plan.highlighted ? 'text-sky-200' : 'text-sky-600'}`}
                      />
                      <span className={`text-sm ${plan.highlighted ? 'text-sky-50' : 'text-gray-600'}`}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.cta === 'Contactar ventas' ? 'mailto:hola@fisiocore.com' : '/registro'}
                  className={`block text-center py-3 rounded-xl font-semibold text-sm transition-all ${
                    plan.highlighted
                      ? 'bg-white text-sky-600 hover:bg-sky-50'
                      : 'bg-sky-600 text-white hover:bg-sky-700'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA FINAL ═══ */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="w-16 h-16 bg-sky-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Heart className="w-8 h-8 text-sky-600" />
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            ¿Listo para modernizar
            <br />
            <span className="text-sky-600">tu clínica?</span>
          </h2>
          <p className="text-gray-500 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Únete a las clínicas que ya gestionan sus pacientes y citas con FisioCore.
            Empieza gratis hoy, sin compromisos.
          </p>
          <Link
            href="/registro"
            className="inline-flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-10 py-4 rounded-xl text-lg font-bold transition-all hover:scale-105 shadow-lg shadow-sky-600/20"
          >
            Comenzar gratis — 14 días
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer id="contacto" className="py-12 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-sky-600 rounded-lg flex items-center justify-center">
                <Activity className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-lg">
                <span className="text-sky-600">Fisio</span>Core
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-gray-400">
              <span>&copy; {new Date().getFullYear()} FisioCore. Todos los derechos reservados.</span>
              <span className="hidden sm:inline">·</span>
              <Link href="/privacidad" className="hover:text-sky-600 transition-colors">Privacidad</Link>
              <span>·</span>
              <Link href="/terminos" className="hover:text-sky-600 transition-colors">Términos</Link>
              <span>·</span>
              <a href="mailto:hola@fisiocore.com" className="hover:text-sky-600 transition-colors">Contacto</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
