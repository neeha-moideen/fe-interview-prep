import type { Filter, Todo, TodoAction, TodoState } from './types'

export const initialTodoState: TodoState = { todos: [], filter: 'all' }

const FILTERS: readonly Filter[] = ['all', 'active', 'completed']

function isTodo(value: unknown): value is Todo {
  if (typeof value !== 'object' || value === null) return false
  const todo = value as Record<string, unknown>
  return (
    typeof todo.id === 'string' &&
    typeof todo.title === 'string' &&
    typeof todo.completed === 'boolean'
  )
}

export function isTodoState(value: unknown): value is TodoState {
  if (typeof value !== 'object' || value === null) return false
  const state = value as Record<string, unknown>
  return (
    Array.isArray(state.todos) &&
    state.todos.every(isTodo) &&
    FILTERS.includes(state.filter as Filter)
  )
}

export function todoReducer(state: TodoState, action: TodoAction): TodoState {
  switch (action.type) {
    case 'add': {
      const title = action.title.trim()
      if (!title) return state
      const todo: Todo = { id: crypto.randomUUID(), title, completed: false }
      return { ...state, todos: [...state.todos, todo] }
    }
    case 'edit': {
      const title = action.title.trim()
      if (!title) return state
      return {
        ...state,
        todos: state.todos.map((todo) => (todo.id === action.id ? { ...todo, title } : todo)),
      }
    }
    case 'toggle':
      return {
        ...state,
        todos: state.todos.map((todo) =>
          todo.id === action.id ? { ...todo, completed: !todo.completed } : todo,
        ),
      }
    case 'remove':
      return { ...state, todos: state.todos.filter((todo) => todo.id !== action.id) }
    case 'clearCompleted':
      return { ...state, todos: state.todos.filter((todo) => !todo.completed) }
    case 'setFilter':
      return { ...state, filter: action.filter }
  }
}

export function visibleTodos(state: TodoState): Todo[] {
  switch (state.filter) {
    case 'active':
      return state.todos.filter((todo) => !todo.completed)
    case 'completed':
      return state.todos.filter((todo) => todo.completed)
    case 'all':
      return state.todos
  }
}

export function activeCount(todos: Todo[]): number {
  return todos.filter((todo) => !todo.completed).length
}
