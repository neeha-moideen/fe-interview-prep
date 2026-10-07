import { describe, expect, it } from 'vitest'
import {
  activeCount,
  initialTodoState,
  isTodoState,
  todoReducer,
  visibleTodos,
} from './todoReducer'
import type { TodoState } from './types'

const seeded: TodoState = {
  filter: 'all',
  todos: [
    { id: 'a', title: 'Write tests', completed: true },
    { id: 'b', title: 'Ship it', completed: false },
  ],
}

describe('todoReducer', () => {
  it('adds a trimmed todo', () => {
    const next = todoReducer(initialTodoState, { type: 'add', title: '  Buy milk  ' })
    expect(next.todos).toHaveLength(1)
    expect(next.todos[0]).toMatchObject({ title: 'Buy milk', completed: false })
  })

  it('ignores empty and whitespace-only titles', () => {
    expect(todoReducer(initialTodoState, { type: 'add', title: '' })).toBe(initialTodoState)
    expect(todoReducer(initialTodoState, { type: 'add', title: '   ' })).toBe(initialTodoState)
  })

  it('edits a title and ignores an empty edit', () => {
    const edited = todoReducer(seeded, { type: 'edit', id: 'b', title: ' Ship it today ' })
    expect(edited.todos[1].title).toBe('Ship it today')
    expect(todoReducer(seeded, { type: 'edit', id: 'b', title: '  ' })).toBe(seeded)
  })

  it('toggles completion', () => {
    const next = todoReducer(seeded, { type: 'toggle', id: 'b' })
    expect(next.todos[1].completed).toBe(true)
  })

  it('removes a todo', () => {
    expect(todoReducer(seeded, { type: 'remove', id: 'a' }).todos.map((t) => t.id)).toEqual(['b'])
  })

  it('clears completed todos', () => {
    expect(todoReducer(seeded, { type: 'clearCompleted' }).todos.map((t) => t.id)).toEqual(['b'])
  })

  it('filters visible todos and counts active ones', () => {
    expect(visibleTodos({ ...seeded, filter: 'active' }).map((t) => t.id)).toEqual(['b'])
    expect(visibleTodos({ ...seeded, filter: 'completed' }).map((t) => t.id)).toEqual(['a'])
    expect(visibleTodos(seeded)).toHaveLength(2)
    expect(activeCount(seeded.todos)).toBe(1)
  })
})

describe('isTodoState', () => {
  it('accepts a valid state and rejects malformed ones', () => {
    expect(isTodoState(seeded)).toBe(true)
    expect(isTodoState({ todos: [{ id: 1 }], filter: 'all' })).toBe(false)
    expect(isTodoState({ todos: [], filter: 'later' })).toBe(false)
    expect(isTodoState(null)).toBe(false)
  })
})
