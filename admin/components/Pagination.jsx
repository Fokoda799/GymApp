export default function Pagination({ page, total, limit, onPageChange }) {
  const totalPages = Math.ceil(total / limit)
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between mt-4">
      <p className="text-xs text-muted font-mono">
        Page {page} of {totalPages} &middot; {total} total
      </p>
      <div className="flex gap-2">
        <button onClick={() => onPageChange(page - 1)} disabled={page <= 1}
          className="px-3 py-1.5 text-xs font-mono rounded border border-border text-white hover:border-accent hover:text-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
          ← PREV
        </button>
        <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}
          className="px-3 py-1.5 text-xs font-mono rounded border border-border text-white hover:border-accent hover:text-accent transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
          NEXT →
        </button>
      </div>
    </div>
  )
}
