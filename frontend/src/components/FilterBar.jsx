export default function FilterBar({ filters, values, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((f) => (
        <select
          key={f.name}
          value={values[f.name] || ''}
          onChange={(e) => onChange(f.name, e.target.value)}
          className="input !w-auto min-w-[130px] py-2"
        >
          <option value="">{f.label}</option>
          {f.options.map((opt) => (
            <option key={opt.value ?? opt} value={opt.value ?? opt}>
              {opt.label ?? opt}
            </option>
          ))}
        </select>
      ))}
    </div>
  )
}
