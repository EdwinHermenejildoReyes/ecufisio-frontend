'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Calendar,
  Users,
  ClipboardList,
  Dumbbell,
  CreditCard,
  FileText,
  BarChart2,
  Settings,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard/agenda', label: 'Agenda', icon: Calendar },
  { href: '/dashboard/pacientes', label: 'Pacientes', icon: Users },
  { href: '/dashboard/expediente', label: 'Expediente', icon: ClipboardList },
  { href: '/dashboard/ejercicios', label: 'Ejercicios', icon: Dumbbell },
  { href: '/dashboard/pagos', label: 'Cobros', icon: CreditCard },
  { href: '/dashboard/facturacion', label: 'Facturación', icon: FileText },
  { href: '/dashboard/reportes', label: 'Reportes', icon: BarChart2 },
  { href: '/dashboard/configuracion', label: 'Configuración', icon: Settings },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-60 bg-white border-r border-gray-100 flex flex-col">
        <div className="px-6 py-5 border-b border-gray-100">
          <span className="text-xl font-bold text-sky-600">ecufisio</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href)
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
                <Icon size={18} />
                {label}
              </Link>
            )
          })}
        </nav>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
