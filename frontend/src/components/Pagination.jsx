export default function Pagination({ page, totalPages, onPageChange, total, pageSize }) {
  if (totalPages <= 1) return null

  const pages = []
  const start = Math.max(1, page - 2)
  const end = Math.min(totalPages, page + 2)
  for (let i = start; i <= end; i++) pages.push(i)

  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-4 border-t border-netflix-dark-3">
      {total != null && (
        <p className="text-netflix-gray text-xs">
          Showing <span className="text-white">{from}–{to}</span> of <span className="text-white">{total}</span>
        </p>
      )}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="w-8 h-8 flex items-center justify-center rounded text-netflix-gray hover:text-white hover:bg-netflix-dark-2 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm"
        >
          ‹
        </button>

        {start > 1 && (
          <>
            <button onClick={() => onPageChange(1)} className="w-8 h-8 flex items-center justify-center rounded text-netflix-gray hover:text-white hover:bg-netflix-dark-2 text-sm transition-all">1</button>
            {start > 2 && <span className="text-netflix-gray px-1 text-sm">…</span>}
          </>
        )}

        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-8 h-8 flex items-center justify-center rounded text-sm font-medium transition-all ${
              p === page ? 'bg-netflix-red text-white' : 'text-netflix-gray hover:text-white hover:bg-netflix-dark-2'
            }`}
          >
            {p}
          </button>
        ))}

        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span className="text-netflix-gray px-1 text-sm">…</span>}
            <button onClick={() => onPageChange(totalPages)} className="w-8 h-8 flex items-center justify-center rounded text-netflix-gray hover:text-white hover:bg-netflix-dark-2 text-sm transition-all">{totalPages}</button>
          </>
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="w-8 h-8 flex items-center justify-center rounded text-netflix-gray hover:text-white hover:bg-netflix-dark-2 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm"
        >
          ›
        </button>
      </div>
    </div>
  )
}
