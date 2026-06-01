/* Animated SVG canvas — inventory/warehouse themed
   Floating boxes, arrows, data nodes, connecting lines.
   Pure CSS animations, no external deps. */
export default function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Red glow filter */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="softglow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="8" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>

          {/* Gradient for lines */}
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#E50914" stopOpacity="0"/>
            <stop offset="50%" stopColor="#E50914" stopOpacity="0.6"/>
            <stop offset="100%" stopColor="#E50914" stopOpacity="0"/>
          </linearGradient>
          <linearGradient id="lineGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E50914" stopOpacity="0"/>
            <stop offset="50%" stopColor="#E50914" stopOpacity="0.4"/>
            <stop offset="100%" stopColor="#E50914" stopOpacity="0"/>
          </linearGradient>

          {/* Box symbol */}
          <symbol id="box" viewBox="0 0 24 24">
            <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </symbol>

          {/* Chart symbol */}
          <symbol id="chart" viewBox="0 0 24 24">
            <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </symbol>

          {/* Cart symbol */}
          <symbol id="cart" viewBox="0 0 24 24">
            <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </symbol>

          {/* User symbol */}
          <symbol id="user" viewBox="0 0 24 24">
            <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </symbol>
        </defs>

        {/* ── Grid lines ── */}
        <g opacity="0.04">
          {[...Array(20)].map((_, i) => (
            <line key={`v${i}`} x1={`${i * 5.26}%`} y1="0" x2={`${i * 5.26}%`} y2="100%" stroke="#E50914" strokeWidth="0.5"/>
          ))}
          {[...Array(12)].map((_, i) => (
            <line key={`h${i}`} x1="0" y1={`${i * 9.09}%`} x2="100%" y2={`${i * 9.09}%`} stroke="#E50914" strokeWidth="0.5"/>
          ))}
        </g>

        {/* ── Animated horizontal scan lines ── */}
        <rect x="0" y="0" width="100%" height="2" fill="url(#lineGrad)" opacity="0.5">
          <animateTransform attributeName="transform" type="translate" from="0 -10" to="0 110%" dur="4s" repeatCount="indefinite"/>
        </rect>
        <rect x="0" y="0" width="100%" height="1" fill="url(#lineGrad)" opacity="0.3">
          <animateTransform attributeName="transform" type="translate" from="0 -10" to="0 110%" dur="6s" begin="2s" repeatCount="indefinite"/>
        </rect>

        {/* ── Animated vertical scan line ── */}
        <rect x="0" y="0" width="2" height="100%" fill="url(#lineGrad2)" opacity="0.3">
          <animateTransform attributeName="transform" type="translate" from="-10 0" to="110% 0" dur="8s" repeatCount="indefinite"/>
        </rect>

        {/* ── Floating inventory icons ── */}
        {/* Box 1 — top left */}
        <g opacity="0" filter="url(#glow)">
          <animate attributeName="opacity" values="0;0.25;0.25;0" dur="6s" begin="0s" repeatCount="indefinite"/>
          <animateTransform attributeName="transform" type="translate" values="80,80; 80,60; 80,80" dur="6s" repeatCount="indefinite"/>
          <use href="#box" x="68" y="68" width="24" height="24" color="#E50914"/>
        </g>

        {/* Chart — top right */}
        <g opacity="0" filter="url(#glow)">
          <animate attributeName="opacity" values="0;0.2;0.2;0" dur="7s" begin="1s" repeatCount="indefinite"/>
          <animateTransform attributeName="transform" type="translate" values="0,0; 0,-15; 0,0" dur="7s" repeatCount="indefinite"/>
          <use href="#chart" x="75%" y="15%" width="28" height="28" color="#E50914"/>
        </g>

        {/* Cart — bottom left */}
        <g opacity="0" filter="url(#glow)">
          <animate attributeName="opacity" values="0;0.2;0.2;0" dur="8s" begin="2s" repeatCount="indefinite"/>
          <animateTransform attributeName="transform" type="translate" values="0,0; 10,0; 0,0" dur="8s" repeatCount="indefinite"/>
          <use href="#cart" x="10%" y="70%" width="26" height="26" color="#E50914"/>
        </g>

        {/* User — mid right */}
        <g opacity="0" filter="url(#glow)">
          <animate attributeName="opacity" values="0;0.18;0.18;0" dur="5s" begin="3s" repeatCount="indefinite"/>
          <animateTransform attributeName="transform" type="translate" values="0,0; -8,8; 0,0" dur="5s" repeatCount="indefinite"/>
          <use href="#user" x="82%" y="45%" width="24" height="24" color="#E50914"/>
        </g>

        {/* Box 2 — bottom right */}
        <g opacity="0" filter="url(#glow)">
          <animate attributeName="opacity" values="0;0.22;0.22;0" dur="9s" begin="0.5s" repeatCount="indefinite"/>
          <animateTransform attributeName="transform" type="translate" values="0,0; 0,12; 0,0" dur="9s" repeatCount="indefinite"/>
          <use href="#box" x="88%" y="75%" width="22" height="22" color="#E50914"/>
        </g>

        {/* ── Pulsing data nodes ── */}
        {[
          { cx: '20%', cy: '30%', r: 3, delay: '0s', dur: '3s' },
          { cx: '50%', cy: '20%', r: 4, delay: '1s', dur: '4s' },
          { cx: '80%', cy: '35%', r: 3, delay: '0.5s', dur: '3.5s' },
          { cx: '15%', cy: '60%', r: 3, delay: '2s', dur: '4s' },
          { cx: '65%', cy: '70%', r: 4, delay: '1.5s', dur: '3s' },
          { cx: '90%', cy: '55%', r: 3, delay: '0.8s', dur: '5s' },
          { cx: '35%', cy: '80%', r: 3, delay: '2.5s', dur: '3.5s' },
        ].map((n, i) => (
          <g key={i}>
            <circle cx={n.cx} cy={n.cy} r={n.r} fill="#E50914" opacity="0.6">
              <animate attributeName="opacity" values="0.6;1;0.6" dur={n.dur} begin={n.delay} repeatCount="indefinite"/>
              <animate attributeName="r" values={`${n.r};${n.r + 1.5};${n.r}`} dur={n.dur} begin={n.delay} repeatCount="indefinite"/>
            </circle>
            {/* Ripple */}
            <circle cx={n.cx} cy={n.cy} r={n.r} fill="none" stroke="#E50914" strokeWidth="1" opacity="0">
              <animate attributeName="r" values={`${n.r};${n.r * 5};${n.r * 5}`} dur={n.dur} begin={n.delay} repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.5;0;0" dur={n.dur} begin={n.delay} repeatCount="indefinite"/>
            </circle>
          </g>
        ))}

        {/* ── Connecting lines between nodes ── */}
        {[
          { x1: '20%', y1: '30%', x2: '50%', y2: '20%', delay: '0s' },
          { x1: '50%', y1: '20%', x2: '80%', y2: '35%', delay: '0.5s' },
          { x1: '20%', y1: '30%', x2: '15%', y2: '60%', delay: '1s' },
          { x1: '80%', y1: '35%', x2: '90%', y2: '55%', delay: '1.5s' },
          { x1: '15%', y1: '60%', x2: '35%', y2: '80%', delay: '2s' },
          { x1: '65%', y1: '70%', x2: '90%', y2: '55%', delay: '0.8s' },
          { x1: '50%', y1: '20%', x2: '65%', y2: '70%', delay: '1.2s' },
        ].map((l, i) => (
          <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
            stroke="#E50914" strokeWidth="0.5" opacity="0">
            <animate attributeName="opacity" values="0;0.2;0.2;0" dur="4s" begin={l.delay} repeatCount="indefinite"/>
            <animate attributeName="strokeDasharray" values="0 200;200 0;200 0" dur="4s" begin={l.delay} repeatCount="indefinite"/>
          </line>
        ))}

        {/* ── Moving data packets along lines ── */}
        <circle r="2.5" fill="#E50914" opacity="0.8" filter="url(#glow)">
          <animateMotion dur="4s" repeatCount="indefinite" begin="0s">
            <mpath href="#path1"/>
          </animateMotion>
          <animate attributeName="opacity" values="0;0.8;0.8;0" dur="4s" repeatCount="indefinite"/>
        </circle>
        <path id="path1" d="M 20% 30% L 50% 20% L 80% 35%" fill="none" opacity="0"/>

        <circle r="2" fill="#ff4444" opacity="0.7" filter="url(#glow)">
          <animateMotion dur="5s" repeatCount="indefinite" begin="1.5s">
            <mpath href="#path2"/>
          </animateMotion>
          <animate attributeName="opacity" values="0;0.7;0.7;0" dur="5s" begin="1.5s" repeatCount="indefinite"/>
        </circle>
        <path id="path2" d="M 15% 60% L 35% 80% L 65% 70% L 90% 55%" fill="none" opacity="0"/>

        {/* ── Large ambient glow orbs ── */}
        <circle cx="25%" cy="40%" r="180" fill="#E50914" opacity="0.025" filter="url(#softglow)">
          <animate attributeName="r" values="180;220;180" dur="8s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.025;0.04;0.025" dur="8s" repeatCount="indefinite"/>
        </circle>
        <circle cx="75%" cy="60%" r="150" fill="#E50914" opacity="0.02" filter="url(#softglow)">
          <animate attributeName="r" values="150;190;150" dur="10s" begin="3s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.02;0.035;0.02" dur="10s" begin="3s" repeatCount="indefinite"/>
        </circle>

        {/* ── Floating number counters (inventory feel) ── */}
        {[
          { x: '8%',  y: '25%', val: '+247', delay: '0s',   dur: '5s' },
          { x: '88%', y: '20%', val: '99.9%', delay: '2s',  dur: '6s' },
          { x: '5%',  y: '80%', val: '1,482', delay: '1s',  dur: '7s' },
          { x: '85%', y: '82%', val: '$48.2k', delay: '3s', dur: '5s' },
        ].map((t, i) => (
          <text key={i} x={t.x} y={t.y} fill="#E50914" fontSize="11" fontFamily="monospace"
            fontWeight="bold" opacity="0">
            {t.val}
            <animate attributeName="opacity" values="0;0.35;0.35;0" dur={t.dur} begin={t.delay} repeatCount="indefinite"/>
            <animateTransform attributeName="transform" type="translate" values="0,0; 0,-8; 0,-8; 0,0" dur={t.dur} begin={t.delay} repeatCount="indefinite"/>
          </text>
        ))}
      </svg>
    </div>
  )
}
