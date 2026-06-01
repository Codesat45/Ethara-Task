import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { dashboardAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'
// StockFlow dashboard

const statCards = [
  {
    key: 'total_products',
    label: 'Total Products',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    color: 'from-blue-900/40 to-blue-900/10',
    border: 'border-blue-800/30',
    iconBg: 'bg-blue-900/50 text-blue-400',
    link: '/products',
  },
  {
    key: 'total_customers',
    label: 'Total Customers',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    color: 'from-green-900/40 to-green-900/10',
    border: 'border-green-800/30',
    iconBg: 'bg-green-900/50 text-green-400',
    link: '/customers',
  },
  {
    key: 'total_orders',
    label: 'Total Orders',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
    color: 'from-purple-900/40 to-purple-900/10',
    border: 'border-purple-800/30',
    iconBg: 'bg-purple-900/50 text-purple-400',
    link: '/orders',
  },
  {
    key: 'total_inventory',
    label: 'Total Inventory',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    color: 'from-netflix-red/20 to-netflix-red/5',
    border: 'border-netflix-red/20',
    iconBg: 'bg-netflix-red/20 text-netflix-red',
    link: '/products',
  },
]

const quickActions = [
  { to: '/products', label: 'Add Product', icon: '+ Product', color: 'bg-blue-900/30 hover:bg-blue-900/50 border-blue-800/30 text-blue-300' },
  { to: '/customers', label: 'Add Customer', icon: '+ Customer', color: 'bg-green-900/30 hover:bg-green-900/50 border-green-800/30 text-green-300' },
  { to: '/orders', label: 'Create Order', icon: '+ Order', color: 'bg-purple-900/30 hover:bg-purple-900/50 border-purple-800/30 text-purple-300' },
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

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white">
          Welcome back, <span className="text-netflix-red">{user?.name?.split(' ')[0]}</span>
        </h1>
        <p className="text-netflix-gray mt-1">Here's what's happening with your inventory today.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {statCards.map((card) => (
          <Link
            key={card.key}
            to={card.link}
            className={`relative overflow-hidden rounded-xl border ${card.border} bg-gradient-to-br ${card.color} p-6 hover:scale-[1.02] transition-all duration-300 group`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.iconBg}`}>
                {card.icon}
              </div>
              <svg className="w-4 h-4 text-netflix-gray group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <div className="text-4xl font-black text-white mb-1">
              {stats?.[card.key]?.toLocaleString() ?? '—'}
            </div>
            <div className="text-netflix-gray text-sm">{card.label}</div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card-netflix">
        <h2 className="text-lg font-bold text-white mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className={`border rounded-lg px-5 py-3 text-sm font-semibold transition-all duration-200 ${action.color}`}
            >
              {action.icon}
            </Link>
          ))}
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          { title: 'Stock Validation', desc: 'Orders are automatically rejected when stock is insufficient. No overselling.', icon: '🛡️' },
          { title: 'Auto Stock Deduction', desc: 'Stock levels update instantly when an order is placed. Always accurate.', icon: '⚡' },
          { title: 'Full Audit Trail', desc: 'Every order, product change, and customer update is tracked with timestamps.', icon: '📋' },
        ].map((item) => (
          <div key={item.title} className="card-netflix group hover:border-netflix-red/30 transition-all duration-300">
            <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">{item.icon}</div>
            <h3 className="text-white font-semibold mb-1">{item.title}</h3>
            <p className="text-netflix-gray text-sm leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
