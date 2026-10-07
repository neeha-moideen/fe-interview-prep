import { useState, type KeyboardEvent } from 'react'
import type { Todo } from '../types'

interface TodoItemProps {
  todo: Todo
  onToggle: (id: string) => void
  onEdit: (id: string, title: string) => void
  onRemove: (id: string) => void
}

const ACTION = 'rounded px-2 py-1 text-sm hover:bg-gray-100'

export default function TodoItem({ todo, onToggle, onEdit, onRemove }: TodoItemProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(todo.title)

  function startEditing() {
    setDraft(todo.title)
    setEditing(true)
  }

  function save() {
    if (draft.trim()) onEdit(todo.id, draft)
    setEditing(false)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') save()
    if (event.key === 'Escape') setEditing(false)
  }

  return (
    <li className="flex items-center gap-3 py-2">
      <input
        type="checkbox"
        aria-label={`Complete ${todo.title}`}
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        className="h-4 w-4"
      />
      {editing ? (
        <input
          aria-label={`Edit ${todo.title}`}
          autoFocus
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 rounded-md border border-gray-300 px-2 py-1 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      ) : (
        <span className={`flex-1 ${todo.completed ? 'text-gray-400 line-through' : ''}`}>
          {todo.title}
        </span>
      )}
      {editing ? (
        <>
          <button type="button" onClick={save} className={`${ACTION} text-primary`}>
            Save
          </button>
          <button type="button" onClick={() => setEditing(false)} className={`${ACTION} text-gray-600`}>
            Cancel
          </button>
        </>
      ) : (
        <>
          <button type="button" onClick={startEditing} className={`${ACTION} text-primary`}>
            Edit
          </button>
          <button
            type="button"
            aria-label={`Delete ${todo.title}`}
            onClick={() => onRemove(todo.id)}
            className={`${ACTION} text-error`}
          >
            Delete
          </button>
        </>
      )}
    </li>
  )
}
