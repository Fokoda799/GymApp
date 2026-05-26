export default function FormField({ label, name, type = "text", value, onChange, options, required }) {
  const base = "w-full bg-surface border border-border rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-accent transition-colors"

  if (type === "select") {
    return (
      <div>
        <label className="block text-xs text-muted font-mono uppercase tracking-wider mb-1.5">{label}</label>
        <select name={name} value={value} onChange={onChange} required={required} className={base}>
          <option value="">Select {label}</option>
          {options?.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
    )
  }

  if (type === "textarea") {
    return (
      <div>
        <label className="block text-xs text-muted font-mono uppercase tracking-wider mb-1.5">{label}</label>
        <textarea name={name} value={value} onChange={onChange} required={required} rows={3}
          className={base + " resize-none"} />
      </div>
    )
  }

  return (
    <div>
      <label className="block text-xs text-muted font-mono uppercase tracking-wider mb-1.5">{label}</label>
      <input name={name} type={type} value={value} onChange={onChange} required={required}
        className={base} />
    </div>
  )
}
