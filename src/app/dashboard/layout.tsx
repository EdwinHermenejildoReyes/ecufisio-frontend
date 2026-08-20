'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import {
  Activity,
  Calendar,
  Users,
  ClipboardList,
  Dumbbell,
  CreditCard,
  FileText,
  BarChart2,
  Settings,
  LogOut,
  Home,
} from 'lucide-react'
import { logoutUser } from '@/store/auth/slices'

const NAV_ITEMS = [
  { href: '/dashboard',              label: 'Inicio',        icon: Home,          exact: true },
  { href: '/dashboard/agenda',       label: 'Agenda',        icon: Calendar,      exact: false },
  { href: '/dashboard/pacientes',    label: 'Pacientes',     icon: Users,         exact: false },
  { href: '/dashboard/expediente',   label: 'Expediente',    icon: ClipboardList, exact: false },
  { href: '/dashboard/ejercicios',   label: 'Ejercicios',    icon: Dumbbell,      exact: false },
  { href: '/dashboard/pagos',        label: 'Cobros',        icon: CreditCard,    exact: false },
  { href: '/dashboard/facturacion',  label: 'Facturación',   icon: FileText,      exact: false },
  { href: '/dashboard/reportes',     label: 'Reportes',      icon: BarChart2,     exact: false },
  { href: '/dashboard/configuracion',label: 'Configuración', icon: Settings,      exact: false },
]

const ROL_LABEL: Record<string, string> = {
  admin:          'Administrador',
  fisioterapeuta: 'Fisioterapeuta',
  recepcionista:  'Recepcionista',
  paciente:       'Paciente',
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const dispatch = useDispatch()
  const { user } = useSelector((state: any) => state.auth)

  const handleLogout = () => {
    dispatch(logoutUser())
    window.location.href = '/login'
  }

  const initials = user
    ? `${user.nombres?.[0] ?? ''}${user.apellidos?.[0] ?? ''}`.toUpperCase()
    : '?'

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* ─── Sidebar ─── */}
      <aside className="w-60 bg-white border-r border-gray-100 flex flex-col shrink-0">

        {/* Logo */}
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-sky-600 rounded-lg flex items-center justify-center">
              <Activity className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-lg font-bold">
              <span className="text-sky-600">ecu</span>fisio
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-sky-50 text-sky-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon size={17} className={active ? 'text-sky-600' : 'text-gray-400'} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* User */}
        <div className="border-t border-gray-100 p-3">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
            <div className="w-8 h-8 bg-sky-100 rounded-full flex items-center justify-center shrink-0">
              <span className="text-sky-700 text-xs font-bold">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.nombres} {user?.apellidos}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {ROL_LABEL[user?.rol ?? ''] ?? user?.rol}
              </p>
            </div>
            <button
              onClick={handleLogout}
              title="Cerrar sesión"
              className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded shrink-0"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* ─── Contenido ─── */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
