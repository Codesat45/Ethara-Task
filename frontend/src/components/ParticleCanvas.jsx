import { useEffect, useRef } from 'react'

/**
 * ParticleCanvas
 * ──────────────
 * A full-viewport canvas that renders:
 *  1. A perspective-projected 3-D grid of dots (warehouse floor feel)
 *  2. Floating particles that drift upward with slight horizontal drift
 *  3. Bezier "data-flow" lines connecting nearby particles
 *  4. Mouse-parallax: the grid tilts subtly toward the cursor
 *
 * Everything is drawn with the native Canvas 2D API inside a
 * requestAnimationFrame loop — no libraries, no vibe-coding shortcuts.
 */
export default function ParticleCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    // ── Resize handler ──────────────────────────────────────────────────────
    let W = 0, H = 0
    function resize() {
      W = canvas.width  = canvas.offsetWidth
      H = canvas.height = canvas.offsetHeight
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    // ── Mouse tracking ──────────────────────────────────────────────────────
    let mx = W / 2, my = H / 2
    const onMove = (e) => { mx = e.clientX; my = e.clientY }
    window.addEventListener('mousemove', onMove)

    // ── Particle system ─────────────────────────────────────────────────────
    const COUNT = 90
    const RED   = '#E50914'

    class Particle {
      constructor() { this.reset(true) }

      reset(initial = false) {
        this.x  = Math.random() * W
        this.y  = initial ? Math.random() * H : H + 10
        this.vx = (Math.random() - 0.5) * 0.4
        this.vy = -(0.3 + Math.random() * 0.7)   // always drifts upward
        this.r  = 1 + Math.random() * 2.5
        this.alpha = 0.15 + Math.random() * 0.55
        this.life  = 0
        this.maxLife = 200 + Math.random() * 300
        // colour: mostly red, occasionally white
        this.red = Math.random() > 0.25
      }

      update() {
        this.x += this.vx
        this.y += this.vy
        this.life++
        // fade in / fade out
        const t = this.life / this.maxLife
        this.currentAlpha = this.alpha * Math.sin(t * Math.PI)
        if (this.life >= this.maxLife || this.y < -10) this.reset()
      }

      draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2)
        ctx.fillStyle = this.red
          ? `rgba(229,9,20,${this.currentAlpha})`
          : `rgba(255,255,255,${this.currentAlpha * 0.4})`
        ctx.fill()
      }
    }

    const particles = Array.from({ length: COUNT }, () => new Particle())

    // ── Connection lines between close particles ─────────────────────────────
    const MAX_DIST = 120

    function drawConnections() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j]
          const dx = a.x - b.x, dy = a.y - b.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist > MAX_DIST) continue
          const alpha = (1 - dist / MAX_DIST) * 0.12
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.strokeStyle = `rgba(229,9,20,${alpha})`
          ctx.lineWidth = 0.6
          ctx.stroke()
        }
      }
    }

    // ── Perspective grid ─────────────────────────────────────────────────────
    // Draws a vanishing-point grid that tilts slightly with mouse position.
    function drawGrid() {
      const vx = W / 2 + (mx - W / 2) * 0.04   // vanishing point X
      const vy = H * 0.62                         // vanishing point Y (below centre)
      const COLS = 14
      const ROWS = 10
      const baseY = H                             // grid starts at bottom edge

      ctx.save()
      ctx.globalAlpha = 0.07

      // Horizontal lines (perspective)
      for (let r = 0; r <= ROWS; r++) {
        const t  = r / ROWS                       // 0 = bottom, 1 = horizon
        const y  = baseY - (baseY - vy) * t
        const hw = (W * 0.9) * (1 - t * 0.85)    // half-width shrinks toward horizon
        ctx.beginPath()
        ctx.moveTo(vx - hw, y)
        ctx.lineTo(vx + hw, y)
        ctx.strokeStyle = RED
        ctx.lineWidth = 0.5
        ctx.stroke()
      }

      // Vertical lines (converge to vanishing point)
      for (let c = 0; c <= COLS; c++) {
        const t  = c / COLS                       // 0 = left, 1 = right
        const bx = W * 0.05 + (W * 0.9) * t      // bottom x
        ctx.beginPath()
        ctx.moveTo(bx, baseY)
        ctx.lineTo(vx, vy)
        ctx.strokeStyle = RED
        ctx.lineWidth = 0.5
        ctx.stroke()
      }

      ctx.restore()
    }

    // ── Ambient glow orbs ────────────────────────────────────────────────────
    let glowT = 0
    function drawGlows() {
      glowT += 0.005
      const positions = [
        { x: W * 0.2, y: H * 0.35, r: Math.min(W, H) * 0.28, phase: 0 },
        { x: W * 0.8, y: H * 0.55, r: Math.min(W, H) * 0.22, phase: Math.PI },
      ]
      positions.forEach(({ x, y, r, phase }) => {
        const pulse = 0.8 + 0.2 * Math.sin(glowT + phase)
        const grad = ctx.createRadialGradient(x, y, 0, x, y, r * pulse)
        grad.addColorStop(0,   'rgba(229,9,20,0.06)')
        grad.addColorStop(0.5, 'rgba(229,9,20,0.025)')
        grad.addColorStop(1,   'rgba(229,9,20,0)')
        ctx.beginPath()
        ctx.arc(x, y, r * pulse, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()
      })
    }

    // ── Scan line ────────────────────────────────────────────────────────────
    let scanY = -H * 0.1
    function drawScan() {
      scanY += 0.6
      if (scanY > H * 1.1) scanY = -H * 0.1
      const grad = ctx.createLinearGradient(0, scanY - 60, 0, scanY + 60)
      grad.addColorStop(0,   'rgba(229,9,20,0)')
      grad.addColorStop(0.5, 'rgba(229,9,20,0.04)')
      grad.addColorStop(1,   'rgba(229,9,20,0)')
      ctx.fillStyle = grad
      ctx.fillRect(0, scanY - 60, W, 120)
    }

    // ── Main loop ────────────────────────────────────────────────────────────
    let raf
    function loop() {
      ctx.clearRect(0, 0, W, H)

      drawGlows()
      drawGrid()
      drawConnections()
      particles.forEach(p => { p.update(); p.draw() })
      drawScan()

      raf = requestAnimationFrame(loop)
    }
    loop()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('mousemove', onMove)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ display: 'block' }}
      aria-hidden="true"
    />
  )
}
