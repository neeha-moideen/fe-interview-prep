export type Filter = 'all' | 'active' | 'completed'

export interface Todo {
  id: string
  title: string
  completed: boolean
}

export interface TodoState {
  todos: Todo[]
  filter: Filter
}

export type TodoAction =
  | { type: 'add'; title: string }
  | { type: 'edit'; id: string; title: string }
  | { type: 'toggle'; id: string }
  | { type: 'remove'; id: string }
  | { type: 'clearCompleted' }
  | { type: 'setFilter'; filter: Filter }
