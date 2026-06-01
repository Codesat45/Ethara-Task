import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { authAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Signup() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const password = watch('password')

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const res = await authAPI.signup({ full_name: data.full_name, email: data.email, password: data.password })
      login(res.data.access_token, res.data.user)
      toast.success(`Welcome to InvFlow, ${res.data.user.full_name}!`)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-netflix-black flex flex-col">
      <div className="fixed inset-0 opacity-5"
        style={{ backgroundImage: 'linear-gradient(rgba(229,9,20,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(229,9,20,0.5) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(229,9,20,0.6) 0%, transparent 70%)' }} />

      <nav className="relative z-10 flex items-center justify-between px-8 py-5">
        <Link to="/" className="text-netflix-red font-black text-2xl">INVFLOW</Link>
      </nav>

      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="card-dark p-8 md:p-10 animate-slide-up">
            <div className="mb-8">
              <h1 className="text-3xl font-black text-white mb-2">Create Account</h1>
              <p className="text-netflix-muted text-sm">Start managing your inventory today</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="input-label">Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="input-dark"
                  {...register('full_name', { required: 'Full name is required', minLength: { value: 2, message: 'Name too short' } })}
                />
                {errors.full_name && <p className="text-netflix-red text-xs mt-1">{errors.full_name.message}</p>}
              </div>

              <div>
                <label className="input-label">Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="input-dark"
                  {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' } })}
                />
                {errors.email && <p className="text-netflix-red text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="input-label">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Min. 6 characters"
                    className="input-dark pr-12"
                    {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-netflix-muted hover:text-white transition-colors text-sm">
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
                {errors.password && <p className="text-netflix-red text-xs mt-1">{errors.password.message}</p>}
              </div>

              <div>
                <label className="input-label">Confirm Password</label>
                <input
                  type="password"
                  placeholder="Repeat password"
                  className="input-dark"
                  {...register('confirm', { required: 'Please confirm password', validate: v => v === password || 'Passwords do not match' })}
                />
                {errors.confirm && <p className="text-netflix-red text-xs mt-1">{errors.confirm.message}</p>}
              </div>

              <button type="submit" disabled={loading} className="btn-red w-full py-3.5 text-base mt-2">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </span>
                ) : 'Create Account'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-netflix-border text-center">
              <p className="text-netflix-muted text-sm">
                Already have an account?{' '}
                <Link to="/login" className="text-white hover:text-netflix-red font-semibold transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
