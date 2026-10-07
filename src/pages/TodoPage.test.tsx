import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import TodoPage from '@/pages/TodoPage'

async function addTodo(title: string) {
  await userEvent.type(screen.getByLabelText('New todo'), `${title}{Enter}`)
}

describe('TodoPage', () => {
  beforeEach(() => window.localStorage.clear())

  it('adds a todo and shows the remaining count', async () => {
    render(<TodoPage />)
    await addTodo('Buy milk')
    expect(screen.getByText('Buy milk')).toBeInTheDocument()
    expect(screen.getByText('1 item left')).toBeInTheDocument()
  })

  it('ignores whitespace-only titles', async () => {
    render(<TodoPage />)
    await addTodo('   ')
    expect(screen.getByText('Nothing to show.')).toBeInTheDocument()
  })

  it('completes, filters and clears completed todos', async () => {
    render(<TodoPage />)
    await addTodo('One')
    await addTodo('Two')
    await userEvent.click(screen.getByLabelText('Complete One'))
    expect(screen.getByText('1 item left')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Active' }))
    expect(screen.queryByText('One')).not.toBeInTheDocument()
    expect(screen.getByText('Two')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Completed' }))
    expect(screen.getByText('One')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Clear completed' }))
    expect(screen.queryByText('One')).not.toBeInTheDocument()
  })

  it('edits and deletes a todo', async () => {
    render(<TodoPage />)
    await addTodo('Old title')
    const row = screen.getByText('Old title').closest('li') as HTMLElement
    await userEvent.click(within(row).getByRole('button', { name: 'Edit' }))
    const input = screen.getByLabelText('Edit Old title')
    await userEvent.clear(input)
    await userEvent.type(input, 'New title{Enter}')
    expect(screen.getByText('New title')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Delete New title' }))
    expect(screen.queryByText('New title')).not.toBeInTheDocument()
  })

  it('keeps todos and the selected filter after a remount', async () => {
    const first = render(<TodoPage />)
    await addTodo('Persist me')
    await userEvent.click(screen.getByLabelText('Complete Persist me'))
    await userEvent.click(screen.getByRole('button', { name: 'Completed' }))
    first.unmount()

    render(<TodoPage />)
    expect(screen.getByText('Persist me')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Completed' })).toHaveAttribute('aria-pressed', 'true')
  })
})
