export default function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="bg-card border border-border rounded-lg w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-border shrink-0">
          <h2 className="text-white font-bold text-lg">{title}</h2>
          <button onClick={onClose} className="text-muted hover:text-white transition-colors text-xl font-mono">✕</button>
        </div>
        <div className="overflow-y-auto p-5 flex-1">
          {children}
        </div>
      </div>
    </div>
  )
}
