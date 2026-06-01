import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { dashboardAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

/* ── Animated counter ── */
function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    if (value == null) return
    let start = 0
    const end = value
    const duration = 900
    const startTime = performance.now()
    const step = (now) => {
      const progress = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.floor(eased * end))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [value])
  return <span>{display.toLocaleString()}</span>
}

const statCards = [
  {
    key: 'total_products',
    label: 'Total Products',
    sublabel: 'In catalog',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    gradient: 'from-[#0d1b3e] to-[#0a0a0a]',
    border: 'border-blue-500/20',
    iconBg: 'bg-blue-500/10 text-blue-400',
    accent: '#3b82f6',
    link: '/products',
  },
  {
    key: 'total_customers',
    label: 'Total Customers',
    sublabel: 'Registered',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    gradient: 'from-[#0d3320] to-[#0a0a0a]',
    border: 'border-emerald-500/20',
    iconBg: 'bg-emerald-500/10 text-emerald-400',
    accent: '#10b981',
    link: '/customers',
  },
  {
    key: 'total_orders',
    label: 'Total Orders',
    sublabel: 'All time',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
    gradient: 'from-[#1e0d3e] to-[#0a0a0a]',
    border: 'border-purple-500/20',
    iconBg: 'bg-purple-500/10 text-purple-400',
    accent: '#a855f7',
    link: '/orders',
  },
  {
    key: 'total_inventory',
    label: 'Total Inventory',
    sublabel: 'Units in stock',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    gradient: 'from-[#3e0d0d] to-[#0a0a0a]',
    border: 'border-[#E50914]/20',
    iconBg: 'bg-[#E50914]/10 text-[#E50914]',
    accent: '#E50914',
    link: '/products',
  },
]

const quickActions = [
  {
    to: '/products',
    label: 'Add Product',
    desc: 'New SKU to catalog',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
      </svg>
    ),
    color: 'text-blue-400',
    bg: 'bg-blue-500/8 hover:bg-blue-500/15 border-blue-500/20 hover:border-blue-500/40',
  },
  {
    to: '/customers',
    label: 'Add Customer',
    desc: 'Register new customer',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
      </svg>
    ),
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/8 hover:bg-emerald-500/15 border-emerald-500/20 hover:border-emerald-500/40',
  },
  {
    to: '/orders',
    label: 'Create Order',
    desc: 'Place a new order',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
      </svg>
    ),
    color: 'text-purple-400',
    bg: 'bg-purple-500/8 hover:bg-purple-500/15 border-purple-500/20 hover:border-purple-500/40',
  },
]

const features = [
  {
    title: 'Stock Validation',
    desc: 'Orders are automatically rejected when stock is insufficient. Zero overselling, guaranteed.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
      </svg>
    ),
    accent: '#10b981',
    bg: 'bg-emerald-500/8 border-emerald-500/15',
    iconColor: 'text-emerald-400',
  },
  {
    title: 'Auto Stock Deduction',
    desc: 'Stock levels update instantly when an order is placed. Always accurate, always real-time.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z"/>
      </svg>
    ),
    accent: '#f59e0b',
    bg: 'bg-amber-500/8 border-amber-500/15',
    iconColor: 'text-amber-400',
  },
  {
    title: 'Full Audit Trail',
    desc: 'Every order, product change, and customer update is tracked with precise timestamps.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
      </svg>
    ),
    accent: '#3b82f6',
    bg: 'bg-blue-500/8 border-blue-500/15',
    iconColor: 'text-blue-400',
  },
]

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    dashboardAPI.getStats()
      .then((res) => setStats(res.data))
      .catch(() => toast.error('Failed to load dashboard stats'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner message="Loading dashboard..." />

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="anim-fade-in space-y-7">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <p className="text-[#555] text-sm font-medium mb-1">{greeting} 👋</p>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Welcome back, <span className="text-[#E50914]">{user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="text-[#555] text-sm mt-1.5">Here's your inventory overview for today.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#444] bg-[#111] border border-[#1e1e1e] rounded-lg px-3 py-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live data</span>
          <span className="text-[#333]">·</span>
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <Link
            key={card.key}
            to={card.link}
            className={`relative overflow-hidden rounded-2xl border ${card.border} bg-gradient-to-br ${card.gradient} p-5 group transition-all duration-300 hover:scale-[1.02]`}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            {/* Glow on hover */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
              style={{ boxShadow: `inset 0 0 40px ${card.accent}10` }}
            />
            {/* Top accent line */}
            <div
              className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: `linear-gradient(90deg, transparent, ${card.accent}, transparent)` }}
            />

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-5">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${card.iconBg} transition-transform duration-300 group-hover:scale-110`}>
                  {card.icon}
                </div>
                <svg className="w-4 h-4 text-[#333] group-hover:text-[#666] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <div className="text-4xl font-black text-white mb-1 tabular-nums">
                {stats ? <AnimatedNumber value={stats[card.key]} /> : '—'}
              </div>
              <div className="text-[#666] text-xs font-semibold uppercase tracking-wider">{card.label}</div>
              <div className="text-[#444] text-xs mt-0.5">{card.sublabel}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Quick Actions + Features row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Quick Actions */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1 h-5 rounded-full bg-[#E50914]" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Quick Actions</h2>
          </div>
          <div className="space-y-2.5">
            {quickActions.map((action) => (
              <Link
                key={action.to}
                to={action.to}
                className={`flex items-center gap-3.5 border rounded-xl px-4 py-3.5 transition-all duration-200 group ${action.bg}`}
              >
                <div className={`${action.color} transition-transform duration-200 group-hover:scale-110`}>
                  {action.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${action.color}`}>{action.label}</p>
                  <p className="text-[#444] text-xs">{action.desc}</p>
                </div>
                <svg className="w-4 h-4 text-[#333] group-hover:text-[#666] transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                </svg>
              </Link>
            ))}
          </div>
        </div>

        {/* Feature highlights */}
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {features.map((f) => (
            <div
              key={f.title}
              className={`border rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02] ${f.bg}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${f.bg} ${f.iconColor}`}>
                {f.icon}
              </div>
              <h3 className="text-white font-bold text-sm mb-2">{f.title}</h3>
              <p className="text-[#555] text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── System status bar ── */}
      <div className="card flex flex-wrap items-center gap-6 py-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[#555] text-xs">API Connected</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-[#555] text-xs">Database Online</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#E50914]" />
          <span className="text-[#555] text-xs">JWT Auth Active</span>
        </div>
        <div className="ml-auto text-[#333] text-xs font-mono">
          InvTrack v1.0.0
        </div>
      </div>
    </div>
  )
}
