export default function StatCard({ label, value, icon }) {
  return (
    <div className="bg-card border border-border rounded-lg p-5 flex items-center gap-4">
      <div className="w-11 h-11 rounded-lg bg-surface border border-border flex items-center justify-center text-accent font-mono text-xl shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-muted text-xs font-mono uppercase tracking-wider">{label}</p>
        <p className="text-white text-2xl font-bold font-mono mt-0.5">{value ?? "—"}</p>
      </div>
    </div>
  )
}
