import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '@/App'

function renderApp(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

describe('App', () => {
  it('opens the todo page by default', () => {
    renderApp()
    expect(screen.getByRole('heading', { name: 'Q1: Todo App' })).toBeInTheDocument()
  })

  it('navigates to another question', async () => {
    renderApp()
    await userEvent.click(screen.getByRole('link', { name: 'Q2 Live Search' }))
    expect(screen.getByRole('heading', { name: 'Q2: Live Search' })).toBeInTheDocument()
  })

  it('numbers every question in the navigation', () => {
    renderApp()
    const names = screen.getAllByRole('link').map((link) => link.textContent?.replace(/\s+/g, ' ').trim())
    expect(names).toEqual([
      'Q1 Todo App',
      'Q2 Live Search',
      'Q3 Registration Wizard',
      'Q4 Data Table',
      'Q5 Login & Session',
    ])
  })

  it('shows the application name as the page title', () => {
    renderApp()
    expect(screen.getByRole('heading', { level: 1, name: 'Frontend Interview Prep' })).toBeInTheDocument()
  })

  it('puts the question in the browser tab title', async () => {
    renderApp('/search')
    expect(document.title).toBe('Q2: Live Search | Frontend Interview Prep')

    await userEvent.click(screen.getByRole('link', { name: 'Q3 Registration Wizard' }))
    expect(document.title).toBe('Q3: Registration Wizard | Frontend Interview Prep')
  })
})
