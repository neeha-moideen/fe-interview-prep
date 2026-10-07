import type { Filter } from '../types'

interface TodoFiltersProps {
  filter: Filter
  onChange: (filter: Filter) => void
}

const OPTIONS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
]

export default function TodoFilters({ filter, onChange }: TodoFiltersProps) {
  return (
    <div role="group" aria-label="Filter todos" className="flex gap-2">
      {OPTIONS.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          aria-pressed={filter === value}
          onClick={() => onChange(value)}
          className={`rounded-md border px-3 py-1 text-sm ${
            filter === value
              ? 'border-primary bg-primary-light font-medium text-primary-hover'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
