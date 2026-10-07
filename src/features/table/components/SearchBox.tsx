import { useEffect, useState } from 'react'

export const SEARCH_DEBOUNCE_MS = 300

interface SearchBoxProps {
  value: string
  label: string
  placeholder?: string
  onCommit: (value: string) => void
}

export default function SearchBox({ value, label, placeholder, onCommit }: SearchBoxProps) {
  const [draft, setDraft] = useState(value)
  const [syncedValue, setSyncedValue] = useState(value)

  if (value !== syncedValue) {
    setSyncedValue(value)
    setDraft(value)
  }

  useEffect(() => {
    if (draft === value) return
    const timer = setTimeout(() => onCommit(draft), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [draft, value, onCommit])

  return (
    <label className="flex flex-col gap-1 text-sm font-medium">
      {label}
      <input
        type="search"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-gray-300 px-3 py-2 font-normal focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      />
    </label>
  )
}
