import { Link } from 'react-router-dom'
import { useEffect, useRef, useState, useCallback } from 'react'
import Logo from '../components/Logo'
import ParticleCanvas from '../components/ParticleCanvas'

/* ─────────────────────────────────────────────────────────────
   Scroll-reveal hook — fires once when element enters viewport
───────────────────────────────────────────────────────────── */
function useReveal(threshold = 0.12) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, visible]
}

/* Wrapper that applies slide-up + fade when it enters the viewport */
function Reveal({ children, delay = 0, className = '', from = 'bottom' }) {
  const [ref, visible] = useReveal()
  const transforms = {
    bottom: 'translateY(36px)',
    left:   'translateX(-36px)',
    right:  'translateX(36px)',
    scale:  'scale(0.92)',
  }
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity:    visible ? 1 : 0,
        transform:  visible ? 'none' : transforms[from],
        transition: `opacity 0.75s ease, transform 0.75s cubic-bezier(0.22,1,0.36,1)`,
        transitionDelay: `${delay}ms`,
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   Animated counter — counts up to a target number on reveal
───────────────────────────────────────────────────────────── */
function Counter({ target, suffix = '', duration = 1800 }) {
  const [val, setVal] = useState(0)
  const [ref, visible] = useReveal()
  useEffect(() => {
    if (!visible) return
    let start = null
    const step = (ts) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setVal(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [visible, target, duration])
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>
}

/* ─────────────────────────────────────────────────────────────
   Typewriter headline
───────────────────────────────────────────────────────────── */
function Typewriter({ text, speed = 55 }) {
  const [displayed, setDisplayed] = useState('')
  useEffect(() => {
    let i = 0
    const id = setInterval(() => {
      setDisplayed(text.slice(0, i + 1))
      i++
      if (i >= text.length) clearInterval(id)
    }, speed)
    return () => clearInterval(id)
  }, [text, speed])
  return (
    <span>
      {displayed}
      <span
        className="inline-block w-0.5 h-[0.9em] bg-[#E50914] ml-0.5 align-middle"
        style={{ animation: displayed.length < text.length ? 'none' : 'blink 1s step-end infinite' }}
      />
    </span>
  )
}

/* ─────────────────────────────────────────────────────────────
   Feature card with hover tilt effect
───────────────────────────────────────────────────────────── */
function FeatureCard({ icon, title, desc, delay }) {
  const cardRef = useRef(null)

  const onMouseMove = useCallback((e) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width  - 0.5   // -0.5 to 0.5
    const y = (e.clientY - rect.top)  / rect.height - 0.5
    card.style.transform = `perspective(600px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-4px)`
    card.style.boxShadow = `${-x * 12}px ${-y * 12}px 32px rgba(229,9,20,0.12)`
  }, [])

  const onMouseLeave = useCallback(() => {
    const card = cardRef.current
    if (!card) return
    card.style.transform = 'perspective(600px) rotateY(0) rotateX(0) translateY(0)'
    card.style.boxShadow = 'none'
  }, [])

  return (
    <Reveal delay={delay}>
      <div
        ref={cardRef}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        className="relative border border-[#1e1e1e] rounded-2xl p-7 bg-[#0e0e0e] overflow-hidden group cursor-default"
        style={{ transition: 'transform 0.15s ease, box-shadow 0.15s ease' }}
      >
        {/* Animated top border */}
        <div
          className="absolute top-0 left-0 h-[2px] bg-gradient-to-r from-[#E50914] to-transparent"
          style={{
            width: '0%',
            transition: 'width 0.5s ease',
          }}
          ref={el => {
            if (el) {
              el.closest('.group')?.addEventListener('mouseenter', () => { el.style.width = '100%' })
              el.closest('.group')?.addEventListener('mouseleave', () => { el.style.width = '0%' })
            }
          }}
        />
        {/* Background glow on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#E50914]/0 to-[#E50914]/0 group-hover:from-[#E50914]/[0.03] group-hover:to-transparent transition-all duration-500" />

        <div className="relative z-10">
          <div className="w-12 h-12 rounded-xl bg-[#E50914]/10 border border-[#E50914]/20 flex items-center justify-center mb-5 text-[#E50914] group-hover:bg-[#E50914]/20 group-hover:border-[#E50914]/40 transition-all duration-300">
            {icon}
          </div>
          <h3 className="text-white font-bold text-base mb-2 tracking-tight">{title}</h3>
          <p className="text-[#666] text-sm leading-relaxed">{desc}</p>
        </div>
      </div>
    </Reveal>
  )
}

/* ─────────────────────────────────────────────────────────────
   BannerSlideshow — Flipkart-style full-width auto-sliding banner
   Each slide is a rich card with gradient background, icon, title,
   subtitle, and a CTA tag. Auto-advances every 3.5s. Supports
   prev/next arrows and dot indicators. Touch/drag swipe on mobile.
───────────────────────────────────────────────────────────── */
const SLIDES = [
  {
    tag: 'Real-Time',
    icon: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <rect x="8" y="16" width="48" height="32" rx="4" stroke="#E50914" strokeWidth="2" fill="none"/>
        <path d="M8 24h48" stroke="#E50914" strokeWidth="2"/>
        <rect x="16" y="32" width="8" height="10" rx="1" fill="#E50914" opacity="0.7"/>
        <rect x="28" y="28" width="8" height="14" rx="1" fill="#E50914"/>
        <rect x="40" y="34" width="8" height="8" rx="1" fill="#E50914" opacity="0.5"/>
        <circle cx="32" cy="20" r="2" fill="#E50914"/>
      </svg>
    ),
    title: 'Product Management',
    subtitle: 'Track every SKU, price & stock level in real time',
    label: 'Live Inventory',
    bg: 'from-[#1a0505] via-[#0f0f0f] to-[#080808]',
    accent: '#E50914',
  },
  {
    tag: 'Automated',
    icon: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <path d="M12 44h40M20 44V28M32 44V20M44 44V32" stroke="#E50914" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="20" cy="24" r="4" fill="#E50914" opacity="0.8"/>
        <circle cx="32" cy="16" r="4" fill="#E50914"/>
        <circle cx="44" cy="28" r="4" fill="#E50914" opacity="0.6"/>
        <path d="M20 24 L32 16 L44 28" stroke="#E50914" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.4"/>
      </svg>
    ),
    title: 'Live Dashboard',
    subtitle: 'See your entire business at a glance with live metrics',
    label: 'Analytics',
    bg: 'from-[#050a1a] via-[#0f0f0f] to-[#080808]',
    accent: '#3b82f6',
  },
  {
    tag: 'Validated',
    icon: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <path d="M16 28h32M16 36h20" stroke="#E50914" strokeWidth="2" strokeLinecap="round"/>
        <rect x="10" y="14" width="44" height="36" rx="4" stroke="#E50914" strokeWidth="2" fill="none"/>
        <path d="M36 42l4 4 8-8" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="16" cy="20" r="2" fill="#E50914" opacity="0.6"/>
        <circle cx="24" cy="20" r="2" fill="#E50914" opacity="0.4"/>
      </svg>
    ),
    title: 'Order Management',
    subtitle: 'Auto stock validation — never oversell again',
    label: 'Smart Orders',
    bg: 'from-[#051a05] via-[#0f0f0f] to-[#080808]',
    accent: '#22c55e',
  },
  {
    tag: 'Secure',
    icon: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <path d="M32 8L12 18v14c0 11 8.4 21.3 20 24 11.6-2.7 20-13 20-24V18L32 8z" stroke="#E50914" strokeWidth="2" fill="none"/>
        <path d="M24 32l6 6 10-10" stroke="#E50914" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="32" cy="28" r="3" fill="#E50914" opacity="0.3"/>
      </svg>
    ),
    title: 'JWT Authentication',
    subtitle: '256-bit encrypted tokens — every endpoint protected',
    label: 'Enterprise Security',
    bg: 'from-[#1a1505] via-[#0f0f0f] to-[#080808]',
    accent: '#f59e0b',
  },
  {
    tag: 'Cloud',
    icon: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <ellipse cx="32" cy="44" rx="20" ry="6" stroke="#E50914" strokeWidth="1.5" opacity="0.3"/>
        <path d="M20 36c0-6.627 5.373-12 12-12s12 5.373 12 12" stroke="#E50914" strokeWidth="2" fill="none"/>
        <path d="M14 36c0-9.941 8.059-18 18-18s18 8.059 18 18" stroke="#E50914" strokeWidth="1.5" opacity="0.4" fill="none"/>
        <circle cx="32" cy="36" r="4" fill="#E50914"/>
        <path d="M32 40v8M28 44h8" stroke="#E50914" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Neon PostgreSQL',
    subtitle: 'Serverless cloud database — always-on, globally fast',
    label: 'Cloud Database',
    bg: 'from-[#05101a] via-[#0f0f0f] to-[#080808]',
    accent: '#06b6d4',
  },
  {
    tag: 'Full-Stack',
    icon: (
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <rect x="8" y="10" width="22" height="22" rx="3" stroke="#E50914" strokeWidth="2" fill="none"/>
        <rect x="34" y="10" width="22" height="22" rx="3" stroke="#E50914" strokeWidth="2" fill="none" opacity="0.6"/>
        <rect x="8" y="36" width="22" height="18" rx="3" stroke="#E50914" strokeWidth="2" fill="none" opacity="0.6"/>
        <rect x="34" y="36" width="22" height="18" rx="3" stroke="#E50914" strokeWidth="2" fill="none"/>
        <path d="M14 21l4 4 8-8" stroke="#E50914" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M40 21l4 4 8-8" stroke="#E50914" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
      </svg>
    ),
    title: 'FastAPI + React',
    subtitle: 'Modern full-stack — sub-100ms API, instant UI updates',
    label: 'Modern Stack',
    bg: 'from-[#0f051a] via-[#0f0f0f] to-[#080808]',
    accent: '#a855f7',
  },
]

function BannerSlideshow() {
  const [current, setCurrent] = useState(0)
  const [prev, setPrev]       = useState(null)
  const [dir, setDir]         = useState(1)   // 1 = forward, -1 = backward
  const [animating, setAnimating] = useState(false)
  const [paused, setPaused]   = useState(false)
  const timerRef = useRef(null)
  const touchStartX = useRef(null)
  const total = SLIDES.length

  const goTo = useCallback((next, direction) => {
    if (animating || next === current) return
    setDir(direction)
    setPrev(current)
    setCurrent(next)
    setAnimating(true)
    setTimeout(() => { setPrev(null); setAnimating(false) }, 520)
  }, [animating, current])

  const next = useCallback(() => goTo((current + 1) % total, 1),  [goTo, current, total])
  const back = useCallback(() => goTo((current - 1 + total) % total, -1), [goTo, current, total])

  // Auto-advance
  useEffect(() => {
    if (paused) return
    timerRef.current = setInterval(next, 3500)
    return () => clearInterval(timerRef.current)
  }, [next, paused])

  // Touch swipe
  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX }
  const onTouchEnd   = (e) => {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(dx) > 40) dx < 0 ? next() : back()
    touchStartX.current = null
  }

  // Slide enter/exit transforms
  const enterFrom  = dir === 1 ? 'translateX(100%)' : 'translateX(-100%)'
  const exitTo     = dir === 1 ? 'translateX(-100%)' : 'translateX(100%)'

  return (
    <div
      className="relative w-full overflow-hidden select-none"
      style={{ background: '#0a0a0a', borderTop: '1px solid #111', borderBottom: '1px solid #111' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* ── Slide track ── */}
      <div className="relative h-[260px] md:h-[320px]">

        {/* Exiting slide */}
        {prev !== null && (
          <div
            key={`exit-${prev}`}
            className="absolute inset-0"
            style={{
              transform: exitTo,
              transition: 'transform 0.5s cubic-bezier(0.4,0,0.2,1)',
            }}
          >
            <SlideContent slide={SLIDES[prev]} />
          </div>
        )}

        {/* Entering slide */}
        <div
          key={`enter-${current}`}
          className="absolute inset-0"
          style={{
            transform: animating ? 'translateX(0)' : 'translateX(0)',
            animation: animating ? `slideEnter${dir > 0 ? 'Right' : 'Left'} 0.5s cubic-bezier(0.4,0,0.2,1) both` : 'none',
          }}
        >
          <SlideContent slide={SLIDES[current]} />
        </div>
      </div>

      {/* ── Prev / Next arrows ── */}
      <button
        onClick={back}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200"
        style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.08)' }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(229,9,20,0.7)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.6)'}
        aria-label="Previous slide"
      >
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7"/>
        </svg>
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200"
        style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.08)' }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(229,9,20,0.7)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.6)'}
        aria-label="Next slide"
      >
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/>
        </svg>
      </button>

      {/* ── Dot indicators ── */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i, i > current ? 1 : -1)}
            aria-label={`Go to slide ${i + 1}`}
            style={{
              width:  i === current ? '24px' : '6px',
              height: '6px',
              borderRadius: '3px',
              background: i === current ? SLIDES[current].accent : 'rgba(255,255,255,0.2)',
              transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          />
        ))}
      </div>

      {/* ── Progress bar ── */}
      {!paused && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-transparent z-20">
          <div
            key={current}
            style={{
              height: '100%',
              background: SLIDES[current].accent,
              animation: 'progressBar 3.5s linear forwards',
              transformOrigin: 'left',
            }}
          />
        </div>
      )}
    </div>
  )
}

/* Individual slide layout */
function SlideContent({ slide }) {
  return (
    <div
      className={`w-full h-full bg-gradient-to-r ${slide.bg} flex items-center justify-center px-8 md:px-16 relative overflow-hidden`}
    >
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(${slide.accent}44 1px, transparent 1px), linear-gradient(90deg, ${slide.accent}44 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Ambient glow */}
      <div
        className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 60% 80% at 80% 50%, ${slide.accent}12 0%, transparent 70%)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-16 max-w-4xl w-full">

        {/* Left — text */}
        <div className="flex-1 text-center md:text-left">
          {/* Tag */}
          <span
            className="inline-block text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full mb-4"
            style={{ background: `${slide.accent}18`, color: slide.accent, border: `1px solid ${slide.accent}30` }}
          >
            {slide.tag}
          </span>

          {/* Title */}
          <h3
            className="text-2xl md:text-4xl font-black tracking-tight mb-3 text-white leading-tight"
          >
            {slide.title}
          </h3>

          {/* Subtitle */}
          <p className="text-[#777] text-sm md:text-base leading-relaxed max-w-sm">
            {slide.subtitle}
          </p>

          {/* Label pill */}
          <div className="mt-5 inline-flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: slide.accent, boxShadow: `0 0 8px ${slide.accent}` }}
            />
            <span className="text-xs font-semibold" style={{ color: slide.accent }}>
              {slide.label}
            </span>
          </div>
        </div>

        {/* Right — SVG illustration */}
        <div
          className="w-28 h-28 md:w-44 md:h-44 flex-shrink-0 opacity-90"
          style={{ filter: `drop-shadow(0 0 24px ${slide.accent}40)` }}
        >
          {slide.icon}
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   MAIN LANDING PAGE
───────────────────────────────────────────────────────────── */
export default function Landing() {
  const [scrolled, setScrolled] = useState(false)
  const [heroLoaded, setHeroLoaded] = useState(false)

  useEffect(() => {
    // Trigger hero animations after mount
    const t = setTimeout(() => setHeroLoaded(true), 80)
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { clearTimeout(t); window.removeEventListener('scroll', onScroll) }
  }, [])

  return (
    <div className="min-h-screen bg-[#080808] text-white overflow-x-hidden">

      {/* ══════════════════════════════════════════════════════
          NAVBAR — frosted glass on scroll
      ══════════════════════════════════════════════════════ */}
      <nav
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          background: scrolled ? 'rgba(8,8,8,0.92)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : '1px solid transparent',
          transition: 'background 0.4s ease, backdrop-filter 0.4s ease, border-color 0.4s ease',
        }}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div
            style={{
              opacity: heroLoaded ? 1 : 0,
              transform: heroLoaded ? 'none' : 'translateX(-16px)',
              transition: 'opacity 0.6s ease, transform 0.6s ease',
            }}
          >
            <Logo size="md" />
          </div>
          <div
            className="flex items-center gap-2"
            style={{
              opacity: heroLoaded ? 1 : 0,
              transform: heroLoaded ? 'none' : 'translateX(16px)',
              transition: 'opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s',
            }}
          >
            <Link
              to="/login"
              className="text-[#999] hover:text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-white/[0.05] transition-all duration-200"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="btn-primary text-sm py-2 px-5"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════════
          HERO — full viewport with canvas background
      ══════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden scanlines">
        {/* Canvas particle animation — full section */}
        <ParticleCanvas />

        {/* Vignette overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 50% 50%, transparent 30%, rgba(8,8,8,0.7) 100%),
              linear-gradient(to bottom, rgba(8,8,8,0.5) 0%, transparent 30%, transparent 70%, rgba(8,8,8,1) 100%)
            `,
          }}
        />

        {/* Hero content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">

          {/* Live badge */}
          <div
            className="inline-flex items-center gap-2.5 rounded-full px-4 py-1.5 mb-10 text-xs font-bold uppercase tracking-widest"
            style={{
              background: 'rgba(229,9,20,0.08)',
              border: '1px solid rgba(229,9,20,0.2)',
              color: '#E50914',
              opacity: heroLoaded ? 1 : 0,
              transform: heroLoaded ? 'none' : 'translateY(-12px)',
              transition: 'opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s',
            }}
          >
            <span
              className="w-2 h-2 rounded-full bg-[#E50914]"
              style={{ animation: 'ripple 1.5s ease-out infinite' }}
            />
            Real-Time Inventory Platform
          </div>

          {/* Main headline */}
          <h1
            className="font-black leading-[1.02] tracking-tight mb-6"
            style={{
              fontSize: 'clamp(2.8rem, 7vw, 5.5rem)',
              opacity: heroLoaded ? 1 : 0,
              transform: heroLoaded ? 'none' : 'translateY(24px)',
              transition: 'opacity 0.8s ease 0.35s, transform 0.8s ease 0.35s',
            }}
          >
            Control Your
            <br />
            <span className="text-glow-red">
              <Typewriter text="Stock Flow" speed={70} />
            </span>
          </h1>

          {/* Sub-headline */}
          <p
            className="text-[#888] text-lg md:text-xl max-w-lg mx-auto mb-10 leading-relaxed"
            style={{
              opacity: heroLoaded ? 1 : 0,
              transform: heroLoaded ? 'none' : 'translateY(20px)',
              transition: 'opacity 0.8s ease 0.5s, transform 0.8s ease 0.5s',
            }}
          >
            Manage products, customers, and orders in one platform.
            Built for speed and reliability.
          </p>

          {/* CTA buttons */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            style={{
              opacity: heroLoaded ? 1 : 0,
              transform: heroLoaded ? 'none' : 'translateY(20px)',
              transition: 'opacity 0.8s ease 0.65s, transform 0.8s ease 0.65s',
            }}
          >
            <Link to="/register" className="btn-primary text-base py-3.5 px-10 btn-ripple">
              Start for Free
            </Link>
            <Link to="/login" className="btn-outline text-base py-3.5 px-10">
              Sign In
            </Link>
          </div>

          {/* Trust line */}
          <p
            className="text-[#444] text-xs mt-8 tracking-wide"
            style={{
              opacity: heroLoaded ? 1 : 0,
              transition: 'opacity 0.8s ease 0.8s',
            }}
          >
            No credit card · Free forever · Open source
          </p>
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          style={{
            opacity: heroLoaded ? 0.4 : 0,
            transition: 'opacity 1s ease 1.2s',
          }}
        >
          <div className="w-5 h-8 border border-white/20 rounded-full flex items-start justify-center pt-1.5">
            <div
              className="w-1 h-2 bg-white rounded-full"
              style={{ animation: 'scrollDot 1.6s ease-in-out infinite' }}
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          BANNER SLIDESHOW — Flipkart-style feature carousel
      ══════════════════════════════════════════════════════ */}
      <BannerSlideshow />

      {/* ══════════════════════════════════════════════════════
          STATS — animated counters
      ══════════════════════════════════════════════════════ */}
      <section className="py-20 px-6 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(229,9,20,0.04) 0%, transparent 70%)' }} />

        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
          {[
            { target: 99,  suffix: '.9%', label: 'Uptime SLA',      prefix: '' },
            { target: 100, suffix: 'ms',  label: 'API Response',    prefix: '<' },
            { target: 5,   suffix: '',    label: 'DB Tables',       prefix: '' },
            { target: 256, suffix: 'bit', label: 'JWT Encryption',  prefix: '' },
          ].map((s, i) => (
            <Reveal key={s.label} delay={i * 80} className="text-center">
              <div className="text-3xl md:text-4xl font-black text-[#E50914] mb-1.5 tabular-nums">
                {s.prefix}<Counter target={s.target} suffix={s.suffix} duration={1600} />
              </div>
              <div className="text-[#555] text-xs uppercase tracking-widest font-semibold">{s.label}</div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FEATURES — 3-D tilt cards
      ══════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 relative overflow-hidden">
        {/* Section background canvas effect */}
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#E50914]/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#E50914]/20 to-transparent" />
        </div>

        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-16">
            <p className="text-[#E50914] text-xs font-bold uppercase tracking-[0.2em] mb-3">Features</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">Everything in one place</h2>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FeatureCard
              delay={0}
              title="Product Management"
              desc="Track every SKU, price, and stock level in real time. Unique SKU enforcement built in."
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>}
            />
            <FeatureCard
              delay={80}
              title="Customer Management"
              desc="Full customer database with email uniqueness, contact info, and order history."
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>}
            />
            <FeatureCard
              delay={160}
              title="Order Management"
              desc="Create orders with automatic stock validation. Insufficient stock is rejected instantly."
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>}
            />
            <FeatureCard
              delay={240}
              title="Live Dashboard"
              desc="See total products, customers, orders, and inventory at a glance. Always up to date."
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>}
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          HOW IT WORKS — animated step connector
      ══════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 relative overflow-hidden" style={{ background: '#0c0c0c' }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 100%, rgba(229,9,20,0.05) 0%, transparent 70%)' }} />

        <div className="max-w-4xl mx-auto relative z-10">
          <Reveal className="text-center mb-16">
            <p className="text-[#E50914] text-xs font-bold uppercase tracking-[0.2em] mb-3">Process</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">Up and running in minutes</h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Connector line (desktop) */}
            <div className="hidden md:block absolute top-8 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(229,9,20,0.3), transparent)' }} />

            {[
              { n: '01', title: 'Create Account',  desc: 'Sign up in seconds. No credit card required.' },
              { n: '02', title: 'Add Your Products', desc: 'Add catalog items with SKUs, prices, and stock levels.' },
              { n: '03', title: 'Manage Orders',    desc: 'Process orders with automatic stock validation.' },
            ].map((step, i) => (
              <Reveal key={step.n} delay={i * 120} className="text-center">
                <div className="relative inline-flex items-center justify-center mb-5">
                  {/* Outer ring */}
                  <div
                    className="w-16 h-16 rounded-full border border-[#E50914]/20 absolute"
                    style={{ animation: `spin-slow ${14 + i * 3}s linear infinite` }}
                  />
                  {/* Inner circle */}
                  <div className="w-12 h-12 rounded-full bg-[#E50914]/8 border border-[#E50914]/30 flex items-center justify-center relative z-10">
                    <span className="text-[#E50914] font-black text-sm">{step.n}</span>
                  </div>
                </div>
                <h3 className="text-white font-bold mb-2 tracking-tight">{step.title}</h3>
                <p className="text-[#555] text-sm leading-relaxed">{step.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          CTA — full-width with canvas background
      ══════════════════════════════════════════════════════ */}
      <section className="relative py-32 px-6 text-center overflow-hidden">
        {/* Canvas background for CTA too */}
        <ParticleCanvas />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse 70% 80% at 50% 50%, rgba(229,9,20,0.07) 0%, transparent 70%),
              linear-gradient(to bottom, rgba(8,8,8,0.9) 0%, rgba(8,8,8,0.6) 50%, rgba(8,8,8,0.9) 100%)
            `,
          }}
        />
        <div className="relative z-10 max-w-xl mx-auto">
          <Reveal>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
              Ready to start?
            </h2>
            <p className="text-[#666] mb-10 text-lg">Free forever. No setup fees. Deploy anywhere.</p>
            <Link
              to="/register"
              className="btn-primary text-base py-4 px-14 btn-ripple anim-pulse-glow"
            >
              Create Free Account
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════════ */}
      <footer className="border-t border-[#111] py-8 px-6 bg-[#080808]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo size="sm" />
          <p className="text-[#333] text-xs">
            © {new Date().getFullYear()} StockFlow — Inventory & Order Management
          </p>
          <div className="flex gap-6 text-[#444] text-xs">
            <Link to="/login"    className="hover:text-white transition-colors duration-200">Sign In</Link>
            <Link to="/register" className="hover:text-white transition-colors duration-200">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
