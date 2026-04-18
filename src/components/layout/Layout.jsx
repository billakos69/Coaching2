import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useState } from 'react'
import {
  LayoutDashboard, Users, Trophy, Dumbbell, Target,
  Calendar, BarChart3, UserCircle, Settings, Menu, X,
  ChevronRight, Zap
} from 'lucide-react'
import { useStore } from '../../store'
import { isSupabaseConfigured } from '../../lib/supabase'

const NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/players', icon: Users, label: 'Players' },
  { to: '/matches', icon: Trophy, label: 'Matches' },
  { to: '/training', icon: Dumbbell, label: 'Training' },
  { to: '/tactics', icon: Target, label: 'Tactics' },
  { to: '/planner', icon: Calendar, label: 'Planner' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/profile', icon: UserCircle, label: 'Coach Profile' },
]

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { coachProfile } = useStore()
  const configured = isSupabaseConfigured()

  return (
    <div className="flex h-screen overflow-hidden bg-carbon-900">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-60 bg-carbon-800 border-r border-carbon-600 
        flex flex-col transition-transform duration-300
        lg:relative lg:translate-x-0
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="flex items-center gap-2 px-5 py-5 border-b border-carbon-600">
          <div className="w-8 h-8 bg-neon-green rounded-lg flex items-center justify-center">
            <Zap size={16} className="text-carbon-900" />
          </div>
          <span className="font-display text-xl tracking-widest text-white">TACTIQ</span>
          <button className="ml-auto lg:hidden" onClick={() => setMobileOpen(false)}>
            <X size={18} className="text-carbon-300" />
          </button>
        </div>

        {/* Coach info */}
        <div className="px-4 py-3 border-b border-carbon-600">
          <p className="text-xs text-carbon-300 uppercase tracking-wider">Head Coach</p>
          <p className="text-sm font-semibold text-white truncate">{coachProfile.name}</p>
          <p className="text-xs text-neon-green truncate">{coachProfile.team}</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'nav-item-active' : 'nav-item-inactive'}`
              }
            >
              <Icon size={16} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Supabase status */}
        <div className="px-4 py-3 border-t border-carbon-600">
          <div className={`flex items-center gap-2 text-xs ${configured ? 'text-neon-green' : 'text-carbon-300'}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${configured ? 'bg-neon-green animate-pulse' : 'bg-carbon-400'}`} />
            {configured ? 'Supabase Connected' : 'Local Mode (Demo)'}
          </div>
          {!configured && (
            <NavLink to="/setup" className="text-xs text-neon-blue mt-1 hover:underline block">
              Connect Supabase →
            </NavLink>
          )}
        </div>
      </aside>

      {/* Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-carbon-800 border-b border-carbon-600 flex items-center px-4 gap-3 lg:hidden">
          <button onClick={() => setMobileOpen(true)} className="text-carbon-300 hover:text-white">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-neon-green rounded flex items-center justify-center">
              <Zap size={12} className="text-carbon-900" />
            </div>
            <span className="font-display text-lg tracking-widest">TACTIQ</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
