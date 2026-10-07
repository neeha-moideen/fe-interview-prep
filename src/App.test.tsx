import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '@/App'

describe('App', () => {
  it('opens the todo page by default', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: 'Q1: Todo App' })).toBeInTheDocument()
  })

  it('navigates to another question', async () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )
    await userEvent.click(screen.getByRole('link', { name: 'Live Search' }))
    expect(screen.getByRole('heading', { name: 'Q2: Live Search' })).toBeInTheDocument()
  })
})
