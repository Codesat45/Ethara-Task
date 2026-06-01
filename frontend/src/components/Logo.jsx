export default function Logo({ size = 'md', className = '' }) {
  const sizes = {
    sm: { icon: 28, text: 'text-lg', gap: 'gap-2' },
    md: { icon: 36, text: 'text-2xl', gap: 'gap-2.5' },
    lg: { icon: 48, text: 'text-3xl', gap: 'gap-3' },
  }
  const s = sizes[size] || sizes.md

  return (
    <div className={`flex items-center ${s.gap} ${className}`}>
      {/* Icon mark */}
      <svg width={s.icon} height={s.icon} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="8" fill="#E50914"/>
        <rect x="5" y="5" width="12" height="12" rx="2" fill="white"/>
        <rect x="23" y="5" width="12" height="12" rx="2" fill="white" fillOpacity="0.7"/>
        <rect x="5" y="23" width="12" height="12" rx="2" fill="white" fillOpacity="0.7"/>
        <rect x="23" y="23" width="12" height="12" rx="2" fill="white" fillOpacity="0.4"/>
      </svg>
      {/* Wordmark */}
      <span className={`font-black tracking-tight ${s.text}`}>
        <span className="text-white">Stock</span><span className="text-[#E50914]">Flow</span>
      </span>
    </div>
  )
}
