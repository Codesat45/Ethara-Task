import { Link } from 'react-router-dom'
import { useEffect, useRef, useState, useCallback } from 'react'
import Logo from '../components/Logo'

/* ═══════════════════════════════════════════════════════════════
   VIDEO SOURCES — free Pexels CDN, inventory / logistics theme
   V1 Hero     : warehouse workers scanning shelves
   V2 Features : server room / data center blinking lights
   V3 Process  : business team working at computers
   V4 CTA      : aerial drone shot of logistics hub / city
═══════════════════════════════════════════════════════════════ */
const VIDEOS = {
  hero:     'https://videos.pexels.com/video-files/3195394/3195394-uhd_2560_1440_25fps.mp4',
  features: 'https://videos.pexels.com/video-files/2278095/2278095-uhd_2560_1440_30fps.mp4',
  process:  'https://videos.pexels.com/video-files/3209828/3209828-uhd_2560_1440_25fps.mp4',
  cta:      'https://videos.pexels.com/video-files/1851190/1851190-uhd_2560_1440_25fps.mp4',
}

/* ═══════════════════════════════════════════════════════════════
   SLIDESHOW DATA — 6 slides, each maps to a feature of StockFlow
═══════════════════════════════════════════════════════════════ */
const SLIDES = [
  {
    tag: 'Real-Time',
    accent: '#E50914',
    bg: 'from-[#2a0505] via-[#140202] to-[#080808]',
    title: 'Live Inventory Tracking',
    subtitle: 'Every SKU, price and stock level updated in real time. Never lose track of what you have.',
    label: 'Product Management',
    icon: (
      <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
        <rect x="10" y="20" width="60" height="40" rx="5" stroke="#E50914" strokeWidth="2" fill="none"/>
        <path d="M10 30h60" stroke="#E50914" strokeWidth="2"/>
        <rect x="18" y="40" width="10" height="12" rx="1" fill="#E50914" opacity="0.8"/>
        <rect x="34" y="35" width="10" height="17" rx="1" fill="#E50914"/>
        <rect x="50" y="43" width="10" height="9" rx="1" fill="#E50914" opacity="0.5"/>
        <circle cx="40" cy="25" r="2.5" fill="#E50914"/>
        <path d="M18 52l10-12 10 6 10-14 10 8" stroke="#E50914" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4"/>
      </svg>
    ),
  },
  {
    tag: 'Automated',
    accent: '#3b82f6',
    bg: 'from-[#020a1a] via-[#050d1a] to-[#080808]',
    title: 'Smart Order Processing',
    subtitle: 'Auto stock validation on every order. Insufficient stock is rejected server-side instantly.',
    label: 'Order Management',
    icon: (
      <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
        <rect x="12" y="16" width="56" height="48" rx="5" stroke="#3b82f6" strokeWidth="2" fill="none"/>
        <path d="M20 32h40M20 42h28" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="56" cy="52" r="10" fill="#3b82f6" opacity="0.15" stroke="#3b82f6" strokeWidth="1.5"/>
        <path d="M51 52l3 3 6-6" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="20" cy="22" r="2" fill="#3b82f6" opacity="0.6"/>
        <circle cx="28" cy="22" r="2" fill="#3b82f6" opacity="0.4"/>
      </svg>
    ),
  },
  {
    tag: 'Analytics',
    accent: '#a855f7',
    bg: 'from-[#0f0520] via-[#0a0315] to-[#080808]',
    title: 'Live Dashboard Metrics',
    subtitle: 'Total products, customers, orders and inventory units — all at a glance, always accurate.',
    label: 'Dashboard',
    icon: (
      <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
        <rect x="8" y="12" width="28" height="28" rx="4" stroke="#a855f7" strokeWidth="2" fill="none"/>
        <rect x="44" y="12" width="28" height="28" rx="4" stroke="#a855f7" strokeWidth="2" fill="none" opacity="0.7"/>
        <rect x="8" y="48" width="28" height="20" rx="4" stroke="#a855f7" strokeWidth="2" fill="none" opacity="0.7"/>
        <rect x="44" y="48" width="28" height="20" rx="4" stroke="#a855f7" strokeWidth="2" fill="none"/>
        <path d="M16 32l5 5 8-10" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M52 28l4 4 8-8" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
        <rect x="52" y="54" width="12" height="8" rx="1" fill="#a855f7" opacity="0.4"/>
      </svg>
    ),
  },
  {
    tag: 'Secure',
    accent: '#f59e0b',
    bg: 'from-[#1a1002] via-[#120c02] to-[#080808]',
    title: 'JWT Authentication',
    subtitle: '256-bit encrypted tokens protect every API endpoint. Bcrypt-hashed passwords, zero config.',
    label: 'Enterprise Security',
    icon: (
      <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
        <path d="M40 8L14 20v18c0 14 10.5 27 26 30 15.5-3 26-16 26-30V20L40 8z" stroke="#f59e0b" strokeWidth="2" fill="none"/>
        <path d="M30 40l7 7 13-13" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="40" cy="34" r="4" fill="#f59e0b" opacity="0.2"/>
      </svg>
    ),
  },
  {
    tag: 'Cloud',
    accent: '#06b6d4',
    bg: 'from-[#02101a] via-[#020d14] to-[#080808]',
    title: 'Neon PostgreSQL Database',
    subtitle: 'Serverless cloud database on AWS. Always-on, globally fast, zero maintenance required.',
    label: 'Cloud Infrastructure',
    icon: (
      <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
        <ellipse cx="40" cy="56" rx="26" ry="8" stroke="#06b6d4" strokeWidth="1.5" opacity="0.3"/>
        <path d="M26 44c0-7.7 6.3-14 14-14s14 6.3 14 14" stroke="#06b6d4" strokeWidth="2" fill="none"/>
        <path d="M18 44c0-12.2 9.8-22 22-22s22 9.8 22 22" stroke="#06b6d4" strokeWidth="1.5" opacity="0.4" fill="none"/>
        <circle cx="40" cy="44" r="5" fill="#06b6d4"/>
        <path d="M40 49v10M35 55h10" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    tag: 'Full-Stack',
    accent: '#10b981',
    bg: 'from-[#021a0a] via-[#021208] to-[#080808]',
    title: 'FastAPI + React 18',
    subtitle: 'Sub-100ms API responses. Instant UI updates. Deployed on Render with Docker containers.',
    label: 'Modern Tech Stack',
    icon: (
      <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
        <rect x="8" y="10" width="28" height="28" rx="4" stroke="#10b981" strokeWidth="2" fill="none"/>
        <rect x="44" y="10" width="28" height="28" rx="4" stroke="#10b981" strokeWidth="2" fill="none" opacity="0.6"/>
        <rect x="8" y="46" width="28" height="24" rx="4" stroke="#10b981" strokeWidth="2" fill="none" opacity="0.6"/>
        <rect x="44" y="46" width="28" height="24" rx="4" stroke="#10b981" strokeWidth="2" fill="none"/>
        <path d="M16 26l5 5 10-10" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M52 26l5 5 10-10" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
        <circle cx="58" cy="58" r="6" fill="#10b981" opacity="0.2" stroke="#10b981" strokeWidth="1.5"/>
        <path d="M55 58h6M58 55v6" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
]

/* ═══════════════════════════════════════════════════════════════
   SectionVideo — full-bleed video background for any section
═══════════════════════════════════════════════════════════════ */
function SectionVideo({ src, tint = 'rgba(4,4,4,0.78)', accent = 'rgba(229,9,20,0.05)', children, className = '' }) {
  const ref = useRef(null)
  const [ready, setReady] = useState(false)
  const [err, setErr] = useState(false)

  useEffect(() => {
    const v = ref.current
    if (!v) return
    v.play().catch(() => setErr(true))
  }, [])

  return (
    <section className={`relative overflow-hidden ${className}`}>
      {!err && (
        <video ref={ref} className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: ready ? 1 : 0, transition: 'opacity 1.4s ease', zIndex: 0 }}
          autoPlay muted loop playsInline preload="auto"
          onCanPlay={() => setReady(true)} onError={() => setErr(true)}>
          <source src={src} type="video/mp4" />
        </video>
      )}
      {err && <div className="absolute inset-0 bg-gradient-to-br from-[#0d0d0d] via-[#111] to-[#080808]" style={{ zIndex: 0 }} />}
      {/* overlay stack */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: tint, zIndex: 1 }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 80% 60% at 50% 50%, ${accent} 0%, transparent 70%)`, zIndex: 2 }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to bottom, rgba(8,8,8,0.5) 0%, transparent 15%, transparent 85%, rgba(8,8,8,0.9) 100%)', zIndex: 3 }} />
      <div className="relative" style={{ zIndex: 10 }}>{children}</div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Flipkart-style Slideshow — full-width, auto-advance 4s,
   slide-in/out animation, arrows, dot indicators, progress bar,
   touch swipe support, pause on hover
═══════════════════════════════════════════════════════════════ */
function SlideContent({ slide }) {
  return (
    <div className={`w-full h-full bg-gradient-to-br ${slide.bg} flex items-center justify-center px-8 md:px-20 relative overflow-hidden`}>
      {/* grid texture */}
      <div className="absolute inset-0 opacity-[0.025]" style={{
        backgroundImage: `linear-gradient(${slide.accent}55 1px, transparent 1px), linear-gradient(90deg, ${slide.accent}55 1px, transparent 1px)`,
        backgroundSize: '48px 48px',
      }} />
      {/* ambient glow */}
      <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none"
        style={{ background: `radial-gradient(ellipse 70% 90% at 85% 50%, ${slide.accent}18 0%, transparent 65%)` }} />
      {/* left glow */}
      <div className="absolute left-0 top-0 bottom-0 w-1/3 pointer-events-none"
        style={{ background: `radial-gradient(ellipse 60% 80% at 15% 50%, ${slide.accent}08 0%, transparent 70%)` }} />

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-10 md:gap-20 max-w-5xl w-full">
        {/* Text */}
        <div className="flex-1 text-center md:text-left">
          <span className="inline-block text-[10px] font-black uppercase tracking-[0.22em] px-3 py-1 rounded-full mb-5"
            style={{ background: `${slide.accent}18`, color: slide.accent, border: `1px solid ${slide.accent}35` }}>
            {slide.tag}
          </span>
          <h3 className="text-2xl md:text-4xl font-black tracking-tight mb-4 text-white leading-tight"
            style={{ textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}>
            {slide.title}
          </h3>
          <p className="text-white/60 text-sm md:text-base leading-relaxed max-w-sm">{slide.subtitle}</p>
          <div className="mt-6 inline-flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full" style={{ background: slide.accent, boxShadow: `0 0 10px ${slide.accent}` }} />
            <span className="text-xs font-bold tracking-wide" style={{ color: slide.accent }}>{slide.label}</span>
          </div>
        </div>
        {/* SVG icon */}
        <div className="w-32 h-32 md:w-52 md:h-52 flex-shrink-0 opacity-95"
          style={{ filter: `drop-shadow(0 0 32px ${slide.accent}50)` }}>
          {slide.icon}
        </div>
      </div>
    </div>
  )
}

function Slideshow() {
  const [cur, setCur] = useState(0)
  const [prev, setPrev] = useState(null)
  const [dir, setDir] = useState(1)
  const [animating, setAnimating] = useState(false)
  const [paused, setPaused] = useState(false)
  const touchX = useRef(null)
  const total = SLIDES.length
  const DURATION = 4000

  const goTo = useCallback((next, d) => {
    if (animating || next === cur) return
    setDir(d); setPrev(cur); setCur(next); setAnimating(true)
    setTimeout(() => { setPrev(null); setAnimating(false) }, 550)
  }, [animating, cur])

  const next = useCallback(() => goTo((cur + 1) % total, 1), [goTo, cur, total])
  const back = useCallback(() => goTo((cur - 1 + total) % total, -1), [goTo, cur, total])

  useEffect(() => {
    if (paused) return
    const id = setInterval(next, DURATION)
    return () => clearInterval(id)
  }, [next, paused])

  const enterAnim = dir > 0 ? 'slideEnterRight' : 'slideEnterLeft'
  const exitTransform = dir > 0 ? 'translateX(-100%)' : 'translateX(100%)'

  return (
    <div className="relative w-full overflow-hidden select-none"
      style={{ background: '#060606', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onTouchStart={e => { touchX.current = e.touches[0].clientX }}
      onTouchEnd={e => {
        if (touchX.current === null) return
        const dx = e.changedTouches[0].clientX - touchX.current
        if (Math.abs(dx) > 45) dx < 0 ? next() : back()
        touchX.current = null
      }}>

      {/* slide track */}
      <div className="relative h-[280px] md:h-[340px]">
        {prev !== null && (
          <div key={`exit-${prev}`} className="absolute inset-0"
            style={{ transform: exitTransform, transition: 'transform 0.52s cubic-bezier(0.4,0,0.2,1)' }}>
            <SlideContent slide={SLIDES[prev]} />
          </div>
        )}
        <div key={`enter-${cur}`} className="absolute inset-0"
          style={{ animation: animating ? `${enterAnim} 0.52s cubic-bezier(0.4,0,0.2,1) both` : 'none' }}>
          <SlideContent slide={SLIDES[cur]} />
        </div>
      </div>

      {/* prev arrow */}
      <button onClick={back} aria-label="Previous"
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200"
        style={{ background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.1)' }}
        onMouseEnter={e => e.currentTarget.style.background = `rgba(229,9,20,0.75)`}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.55)'}>
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7"/>
        </svg>
      </button>

      {/* next arrow */}
      <button onClick={next} aria-label="Next"
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200"
        style={{ background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.1)' }}
        onMouseEnter={e => e.currentTarget.style.background = `rgba(229,9,20,0.75)`}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.55)'}>
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/>
        </svg>
      </button>

      {/* dot indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {SLIDES.map((s, i) => (
          <button key={i} onClick={() => goTo(i, i > cur ? 1 : -1)} aria-label={`Slide ${i + 1}`}
            style={{
              width: i === cur ? '28px' : '7px', height: '7px', borderRadius: '4px', padding: 0, border: 'none', cursor: 'pointer',
              background: i === cur ? SLIDES[cur].accent : 'rgba(255,255,255,0.18)',
              transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
              boxShadow: i === cur ? `0 0 8px ${SLIDES[cur].accent}80` : 'none',
            }} />
        ))}
      </div>

      {/* progress bar */}
      {!paused && (
        <div className="absolute bottom-0 left-0 right-0 h-[3px] z-20">
          <div key={`${cur}-${paused}`} style={{
            height: '100%', background: SLIDES[cur].accent,
            animation: `progressBar ${DURATION}ms linear forwards`,
            transformOrigin: 'left',
            boxShadow: `0 0 8px ${SLIDES[cur].accent}`,
          }} />
        </div>
      )}
    </div>
  )
}

/* ─── Scroll-reveal ─── */
function useReveal(threshold = 0.1) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold })
    obs.observe(el); return () => obs.disconnect()
  }, [threshold])
  return [ref, visible]
}
function Reveal({ children, delay = 0, className = '', from = 'bottom' }) {
  const [ref, visible] = useReveal()
  const t = { bottom: 'translateY(40px)', left: 'translateX(-40px)', right: 'translateX(40px)', scale: 'scale(0.9)' }
  return (
    <div ref={ref} className={className} style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : t[from], transition: `opacity 0.8s ease, transform 0.8s cubic-bezier(0.22,1,0.36,1)`, transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}

/* ─── Animated counter ─── */
function Counter({ target, suffix = '', prefix = '', duration = 1800 }) {
  const [val, setVal] = useState(0)
  const [ref, visible] = useReveal()
  useEffect(() => {
    if (!visible) return
    let start = null
    const step = ts => {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      setVal(Math.floor((1 - Math.pow(1 - p, 3)) * target))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [visible, target, duration])
  return <span ref={ref}>{prefix}{val.toLocaleString()}{suffix}</span>
}

/* ─── Typewriter ─── */
function Typewriter({ text, speed = 60 }) {
  const [d, setD] = useState('')
  useEffect(() => {
    let i = 0
    const id = setInterval(() => { setD(text.slice(0, i + 1)); i++; if (i >= text.length) clearInterval(id) }, speed)
    return () => clearInterval(id)
  }, [text, speed])
  return (
    <span>{d}<span className="inline-block w-0.5 h-[0.9em] bg-[#E50914] ml-0.5 align-middle"
      style={{ animation: d.length < text.length ? 'none' : 'blink 1s step-end infinite' }} /></span>
  )
}

/* ─── Glass feature card ─── */
function FeatureCard({ icon, title, desc, delay, accent = '#E50914' }) {
  return (
    <Reveal delay={delay}>
      <div className="group relative rounded-2xl p-6 cursor-default transition-all duration-300 hover:-translate-y-1"
        style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 4px 24px rgba(0,0,0,0.35)' }}
        onMouseEnter={e => e.currentTarget.style.border = `1px solid ${accent}45`}
        onMouseLeave={e => e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)'}>
        <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
        <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
          style={{ background: `${accent}15`, border: `1px solid ${accent}25`, color: accent }}>{icon}</div>
        <h3 className="text-white font-bold text-sm mb-2 tracking-tight">{title}</h3>
        <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
      </div>
    </Reveal>
  )
}

/* ═══════════════════════════════════════════════════════════════
   MAIN LANDING PAGE
═══════════════════════════════════════════════════════════════ */
export default function Landing() {
  const [scrolled, setScrolled] = useState(false)
  const [heroLoaded, setHeroLoaded] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setHeroLoaded(true), 80)
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { clearTimeout(t); window.removeEventListener('scroll', onScroll) }
  }, [])

  return (
    <div className="bg-[#080808] text-white overflow-x-hidden">

      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: scrolled ? 'rgba(6,6,6,0.94)' : 'transparent',
          backdropFilter: scrolled ? 'blur(24px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
        }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div style={{ opacity: heroLoaded ? 1 : 0, transform: heroLoaded ? 'none' : 'translateX(-16px)', transition: 'all 0.6s ease' }}>
            <Logo size="md" />
          </div>
          <div className="flex items-center gap-2"
            style={{ opacity: heroLoaded ? 1 : 0, transform: heroLoaded ? 'none' : 'translateX(16px)', transition: 'all 0.6s ease 0.1s' }}>
            <Link to="/login" className="text-white/60 hover:text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-white/5 transition-all duration-200">Sign In</Link>
            <Link to="/register" className="btn-primary text-sm py-2 px-5">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════════
          SECTION 1 — HERO  (warehouse / logistics video)
      ══════════════════════════════════════════════════════ */}
      <SectionVideo src={VIDEOS.hero} tint="rgba(3,3,3,0.74)" accent="rgba(229,9,20,0.07)"
        className="min-h-screen flex items-center justify-center">
        <div className="text-center px-6 max-w-4xl mx-auto py-32">
          {/* badge */}
          <div className="inline-flex items-center gap-2.5 rounded-full px-4 py-1.5 mb-10 text-xs font-bold uppercase tracking-widest"
            style={{ background: 'rgba(229,9,20,0.1)', border: '1px solid rgba(229,9,20,0.28)', color: '#E50914', opacity: heroLoaded ? 1 : 0, transform: heroLoaded ? 'none' : 'translateY(-12px)', transition: 'all 0.7s ease 0.2s' }}>
            <span className="w-2 h-2 rounded-full bg-[#E50914]" style={{ animation: 'ripple 1.5s ease-out infinite' }} />
            Real-Time Inventory Platform
          </div>
          {/* headline */}
          <h1 className="font-black leading-[1.02] tracking-tight mb-6"
            style={{ fontSize: 'clamp(2.8rem, 7vw, 5.5rem)', opacity: heroLoaded ? 1 : 0, transform: heroLoaded ? 'none' : 'translateY(24px)', transition: 'all 0.8s ease 0.35s', textShadow: '0 2px 40px rgba(0,0,0,0.85)' }}>
            Control Your<br />
            <span style={{ color: '#E50914', textShadow: '0 0 50px rgba(229,9,20,0.55), 0 2px 40px rgba(0,0,0,0.85)' }}>
              <Typewriter text="Stock Flow" speed={70} />
            </span>
          </h1>
          {/* sub */}
          <p className="text-white/70 text-lg md:text-xl max-w-lg mx-auto mb-10 leading-relaxed"
            style={{ opacity: heroLoaded ? 1 : 0, transform: heroLoaded ? 'none' : 'translateY(20px)', transition: 'all 0.8s ease 0.5s', textShadow: '0 1px 12px rgba(0,0,0,0.9)' }}>
            Manage products, customers, and orders in one platform. Built for speed and reliability.
          </p>
          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4"
            style={{ opacity: heroLoaded ? 1 : 0, transform: heroLoaded ? 'none' : 'translateY(20px)', transition: 'all 0.8s ease 0.65s' }}>
            <Link to="/register" className="btn-primary text-base py-3.5 px-10 btn-ripple">Start for Free</Link>
            <Link to="/login" className="btn-outline text-base py-3.5 px-10"
              style={{ backdropFilter: 'blur(8px)', background: 'rgba(255,255,255,0.05)' }}>Sign In</Link>
          </div>
          <p className="text-white/25 text-xs mt-8 tracking-wide"
            style={{ opacity: heroLoaded ? 1 : 0, transition: 'opacity 0.8s ease 0.8s' }}>
            No credit card · Free forever · Open source
          </p>
        </div>
        {/* scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          style={{ opacity: heroLoaded ? 0.5 : 0, transition: 'opacity 1s ease 1.2s' }}>
          <div className="w-5 h-8 border border-white/20 rounded-full flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 bg-white rounded-full" style={{ animation: 'scrollDot 1.6s ease-in-out infinite' }} />
          </div>
        </div>
      </SectionVideo>

      {/* ══════════════════════════════════════════════════════
          FLIPKART SLIDESHOW — 6 feature slides, auto-advance
      ══════════════════════════════════════════════════════ */}
      <Slideshow />

      {/* ══════════════════════════════════════════════════════
          STATS BAR
      ══════════════════════════════════════════════════════ */}
      <div className="bg-[#080808] border-b border-white/5 py-12 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { target: 99, suffix: '.9%', prefix: '', label: 'Uptime SLA' },
            { target: 100, suffix: 'ms', prefix: '<', label: 'API Response' },
            { target: 5, suffix: '', prefix: '', label: 'DB Tables' },
            { target: 256, suffix: '-bit', prefix: '', label: 'JWT Encryption' },
          ].map((s, i) => (
            <Reveal key={s.label} delay={i * 80} className="text-center">
              <div className="text-3xl md:text-4xl font-black text-[#E50914] mb-1.5 tabular-nums">
                <Counter target={s.target} suffix={s.suffix} prefix={s.prefix} duration={1600} />
              </div>
              <div className="text-white/30 text-xs uppercase tracking-widest font-semibold">{s.label}</div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          SECTION 2 — FEATURES  (data center / server video)
      ══════════════════════════════════════════════════════ */}
      <SectionVideo src={VIDEOS.features} tint="rgba(2,2,8,0.83)" accent="rgba(59,130,246,0.06)" className="py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-16">
            <span className="inline-block text-[#E50914] text-xs font-black uppercase tracking-[0.2em] mb-3 px-3 py-1 rounded-full"
              style={{ background: 'rgba(229,9,20,0.1)', border: '1px solid rgba(229,9,20,0.2)' }}>Features</span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mt-3" style={{ textShadow: '0 2px 30px rgba(0,0,0,0.9)' }}>
              Everything in one place
            </h2>
            <p className="text-white/50 mt-4 text-lg max-w-xl mx-auto">A complete inventory system — from product catalog to order fulfillment.</p>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <FeatureCard delay={0} accent="#E50914" title="Product Management"
              desc="Track every SKU, price, and stock level in real time. Unique SKU enforcement built in."
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>} />
            <FeatureCard delay={80} accent="#10b981" title="Customer Management"
              desc="Full customer database with email uniqueness, contact info, and order history."
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>} />
            <FeatureCard delay={160} accent="#a855f7" title="Order Management"
              desc="Create orders with automatic stock validation. Insufficient stock is rejected instantly."
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>} />
            <FeatureCard delay={240} accent="#3b82f6" title="Live Dashboard"
              desc="See total products, customers, orders, and inventory at a glance. Always up to date."
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>} />
          </div>
          <Reveal delay={300} className="flex flex-wrap justify-center gap-3 mt-14">
            {['FastAPI', 'React 18', 'PostgreSQL', 'JWT Auth', 'Tailwind CSS', 'Docker', 'Render'].map(tech => (
              <span key={tech} className="text-xs font-semibold px-4 py-2 rounded-full"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)' }}>
                {tech}
              </span>
            ))}
          </Reveal>
        </div>
      </SectionVideo>

      {/* ══════════════════════════════════════════════════════
          SECTION 3 — HOW IT WORKS  (office / workflow video)
      ══════════════════════════════════════════════════════ */}
      <SectionVideo src={VIDEOS.process} tint="rgba(4,4,4,0.81)" accent="rgba(16,185,129,0.05)" className="py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-16">
            <span className="inline-block text-emerald-400 text-xs font-black uppercase tracking-[0.2em] mb-3 px-3 py-1 rounded-full"
              style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>Process</span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mt-3" style={{ textShadow: '0 2px 30px rgba(0,0,0,0.9)' }}>
              Up and running in minutes
            </h2>
            <p className="text-white/50 mt-4 text-lg max-w-xl mx-auto">Three simple steps to take full control of your inventory.</p>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            <div className="hidden md:block absolute top-10 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(16,185,129,0.4), transparent)' }} />
            {[
              { n: '01', title: 'Create Account', desc: 'Sign up in seconds. No credit card required. Instant access to all features.', accent: '#E50914' },
              { n: '02', title: 'Add Your Products', desc: 'Add catalog items with SKUs, prices, stock levels, and product images.', accent: '#10b981' },
              { n: '03', title: 'Manage Orders', desc: 'Process orders with automatic stock validation and real-time deduction.', accent: '#3b82f6' },
            ].map((step, i) => (
              <Reveal key={step.n} delay={i * 140} className="text-center">
                <div className="relative inline-flex items-center justify-center mb-6">
                  <div className="w-20 h-20 rounded-full absolute" style={{ border: `1px solid ${step.accent}30`, animation: `spin-slow ${14 + i * 3}s linear infinite` }} />
                  <div className="w-14 h-14 rounded-full flex items-center justify-center relative z-10"
                    style={{ background: `${step.accent}12`, border: `1px solid ${step.accent}35`, backdropFilter: 'blur(8px)' }}>
                    <span className="font-black text-base" style={{ color: step.accent }}>{step.n}</span>
                  </div>
                </div>
                <h3 className="text-white font-bold text-lg mb-3 tracking-tight">{step.title}</h3>
                <p className="text-white/45 text-sm leading-relaxed max-w-xs mx-auto">{step.desc}</p>
              </Reveal>
            ))}
          </div>
          <Reveal delay={400} className="mt-16">
            <div className="rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 text-center md:text-left"
              style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(229,9,20,0.12)', border: '1px solid rgba(229,9,20,0.25)' }}>
                <svg className="w-7 h-7 text-[#E50914]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-white font-bold text-lg mb-1">Enterprise-grade security, zero config</h4>
                <p className="text-white/45 text-sm leading-relaxed">Every endpoint is protected by 256-bit JWT tokens. Passwords are bcrypt-hashed. Stock validation runs server-side — no client-side tricks.</p>
              </div>
              <Link to="/register" className="btn-sm py-2.5 px-6 flex-shrink-0">Get Started</Link>
            </div>
          </Reveal>
        </div>
      </SectionVideo>

      {/* ══════════════════════════════════════════════════════
          SECTION 4 — CTA  (aerial city / supply chain video)
      ══════════════════════════════════════════════════════ */}
      <SectionVideo src={VIDEOS.cta} tint="rgba(3,3,3,0.78)" accent="rgba(229,9,20,0.08)" className="py-36 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <Reveal>
            <span className="inline-block text-[#E50914] text-xs font-black uppercase tracking-[0.2em] mb-6 px-3 py-1 rounded-full"
              style={{ background: 'rgba(229,9,20,0.1)', border: '1px solid rgba(229,9,20,0.2)' }}>
              Get Started Today
            </span>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6"
              style={{ textShadow: '0 2px 40px rgba(0,0,0,0.9), 0 0 80px rgba(229,9,20,0.15)' }}>
              Ready to take control?
            </h2>
            <p className="text-white/55 text-xl mb-12 leading-relaxed max-w-xl mx-auto">
              Free forever. No setup fees. Deploy anywhere. Your inventory, your rules.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link to="/register" className="btn-primary text-base py-4 px-14 btn-ripple anim-pulse-glow">
                Create Free Account
              </Link>
              <Link to="/login" className="btn-outline text-base py-4 px-10"
                style={{ backdropFilter: 'blur(8px)', background: 'rgba(255,255,255,0.04)' }}>
                Sign In
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6">
              {[{ icon: '🔐', label: '256-bit JWT' }, { icon: '⚡', label: 'Sub-100ms API' }, { icon: '☁️', label: 'Cloud Hosted' }, { icon: '🌐', label: 'Open Source' }].map(b => (
                <div key={b.label} className="flex items-center gap-2 text-white/35 text-sm">
                  <span>{b.icon}</span><span>{b.label}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </SectionVideo>

      {/* ── FOOTER ── */}
      <footer className="bg-[#060606] border-t border-white/5 py-10 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <Logo size="sm" />
            <div className="flex gap-8 text-white/30 text-sm">
              <Link to="/login" className="hover:text-white transition-colors duration-200">Sign In</Link>
              <Link to="/register" className="hover:text-white transition-colors duration-200">Register</Link>
              <a href="https://ethara-task-3597.onrender.com/docs" target="_blank" rel="noopener noreferrer"
                className="hover:text-white transition-colors duration-200">API Docs</a>
            </div>
          </div>
          <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-white/20 text-xs">© {new Date().getFullYear()} StockFlow — Inventory & Order Management System</p>
            <div className="flex items-center gap-2 text-white/20 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>All systems operational</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}
