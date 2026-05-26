export default function ConfirmDelete({ onConfirm, onCancel, label = "this item" }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="bg-card border border-border rounded-lg p-6 w-full max-w-sm">
        <p className="text-white font-bold text-lg mb-1">Delete {label}?</p>
        <p className="text-muted text-sm mb-6">This action cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 px-4 py-2 text-sm rounded border border-border text-white hover:bg-surface transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm}
            className="flex-1 px-4 py-2 text-sm rounded bg-red-600 hover:bg-red-500 text-white font-bold transition-colors">
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
