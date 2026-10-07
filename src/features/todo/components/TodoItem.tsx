import { useState, type KeyboardEvent } from 'react'
import type { Todo } from '../types'

interface TodoItemProps {
  todo: Todo
  onToggle: (id: string) => void
  onEdit: (id: string, title: string) => void
  onRemove: (id: string) => void
}

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
    <li className="flex items-center gap-3 border-b border-gray-200 py-2">
      <input
        type="checkbox"
        aria-label={`Complete ${todo.title}`}
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
      />
      {editing ? (
        <input
          aria-label={`Edit ${todo.title}`}
          autoFocus
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 rounded border border-gray-300 px-2 py-1"
        />
      ) : (
        <span className={`flex-1 ${todo.completed ? 'text-gray-400 line-through' : ''}`}>
          {todo.title}
        </span>
      )}
      {editing ? (
        <>
          <button type="button" onClick={save} className="text-sm text-blue-600">
            Save
          </button>
          <button type="button" onClick={() => setEditing(false)} className="text-sm text-gray-600">
            Cancel
          </button>
        </>
      ) : (
        <>
          <button type="button" onClick={startEditing} className="text-sm text-blue-600">
            Edit
          </button>
          <button
            type="button"
            aria-label={`Delete ${todo.title}`}
            onClick={() => onRemove(todo.id)}
            className="text-sm text-red-600"
          >
            Delete
          </button>
        </>
      )}
    </li>
  )
}
