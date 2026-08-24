'use client'

import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, Calendar, Dumbbell, ClipboardList, User } from 'lucide-react'

const NAV = [
  { href: '/paciente',           label: 'Inicio',    icon: Home         },
  { href: '/paciente/citas',     label: 'Citas',     icon: Calendar     },
  { href: '/paciente/ejercicios',label: 'Ejercicios',icon: Dumbbell     },
  { href: '/paciente/historial', label: 'Historial', icon: ClipboardList},
  { href: '/paciente/perfil',    label: 'Perfil',    icon: User         },
]

export default function PacienteLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useSelector((s: any) => s.auth)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login')
    } else if (user?.rol && user.rol !== 'paciente') {
      router.replace('/dashboard')
    }
  }, [isAuthenticated, user, router])

  if (!isAuthenticated || (user?.rol && user.rol !== 'paciente')) return null

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-sky-600 text-white px-5 py-4 sticky top-0 z-20 shadow-sm">
        <p className="text-xs opacity-75">Bienvenido/a</p>
        <p className="font-semibold text-lg leading-tight">
          {user?.nombres ? `${user.nombres} ${user.apellidos || ''}`.trim() : 'Mi portal'}
        </p>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-lg w-full mx-auto px-4 pt-4 pb-24">
        {children}
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-20 safe-area-bottom">
        <div className="max-w-lg mx-auto flex">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = href === '/paciente'
              ? pathname === '/paciente'
              : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors ${
                  active ? 'text-sky-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'stroke-sky-600' : ''}`} />
                {label}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
