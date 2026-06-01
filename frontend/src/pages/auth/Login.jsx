import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../context/AuthContext'
import Logo from '../../components/Logo'
import ParticleCanvas from '../../components/ParticleCanvas'
import toast from 'react-hot-toast'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await login(data.email, data.password)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col relative overflow-hidden">
      {/* Animated background */}
      <ParticleCanvas />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/80 via-[#0a0a0a]/60 to-[#0a0a0a]/80 pointer-events-none" />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-4">
        <Link to="/"><Logo size="md" /></Link>
        <Link to="/register" className="text-[#b3b3b3] hover:text-white text-sm transition-colors">
          New here? <span className="text-white font-semibold">Create account →</span>
        </Link>
      </nav>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <div className="w-full max-w-sm animate-scale-in">
          {/* Card */}
          <div className="bg-[#111]/90 backdrop-blur-xl rounded-2xl p-8 border border-white/8 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
            {/* Header */}
            <div className="mb-7">
              <h1 className="text-2xl font-black text-white mb-1">Sign In</h1>
              <p className="text-[#666] text-sm">Welcome back to InvTrack</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#999] uppercase tracking-wider mb-1.5">Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="input-netflix"
                  {...register('email', { required: 'Email is required' })}
                />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#999] uppercase tracking-wider mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="input-netflix pr-16"
                    {...register('password', { required: 'Password is required' })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] hover:text-white transition-colors text-xs font-medium"
                  >
                    {showPass ? 'Hide' : 'Show'}
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#E50914] hover:bg-[#b20710] text-white font-bold py-3 rounded-lg transition-all duration-200 active:scale-95 disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : 'Sign In'}
              </button>
            </form>

            <p className="text-center text-[#666] text-sm mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-white hover:text-[#E50914] font-semibold transition-colors">
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
