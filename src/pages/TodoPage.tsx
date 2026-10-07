import TodoFilters from '@/features/todo/components/TodoFilters'
import TodoForm from '@/features/todo/components/TodoForm'
import TodoItem from '@/features/todo/components/TodoItem'
import {
  activeCount,
  initialTodoState,
  isTodoState,
  todoReducer,
  visibleTodos,
} from '@/features/todo/todoReducer'
import type { TodoAction } from '@/features/todo/types'
import { useLocalStorage } from '@/lib/useLocalStorage'

const STORAGE_KEY = 'fe-interview-prep:todos'

export default function TodoPage() {
  const [state, setState] = useLocalStorage(STORAGE_KEY, initialTodoState, isTodoState)

  function dispatch(action: TodoAction) {
    setState((current) => todoReducer(current, action))
  }

  const todos = visibleTodos(state)
  const remaining = activeCount(state.todos)
  const hasCompleted = state.todos.some((todo) => todo.completed)

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Q1: Todo App</h2>
      <TodoForm onAdd={(title) => dispatch({ type: 'add', title })} />
      <TodoFilters
        filter={state.filter}
        onChange={(filter) => dispatch({ type: 'setFilter', filter })}
      />
      {todos.length === 0 ? (
        <p className="py-6 text-center text-gray-500">Nothing to show.</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {todos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={(id) => dispatch({ type: 'toggle', id })}
              onEdit={(id, title) => dispatch({ type: 'edit', id, title })}
              onRemove={(id) => dispatch({ type: 'remove', id })}
            />
          ))}
        </ul>
      )}
      <div className="flex items-center justify-between border-t border-gray-200 pt-3 text-sm text-gray-600">
        <span>
          {remaining} {remaining === 1 ? 'item' : 'items'} left
        </span>
        <button
          type="button"
          disabled={!hasCompleted}
          onClick={() => dispatch({ type: 'clearCompleted' })}
          className="text-primary hover:underline disabled:text-gray-400 disabled:no-underline"
        >
          Clear completed
        </button>
      </div>
    </section>
  )
}
