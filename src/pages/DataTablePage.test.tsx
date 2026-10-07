import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { okUsersResponse, rawUsers } from '@/features/users/fixtures'
import DataTablePage from '@/pages/DataTablePage'

const fetchMock = vi.fn()

const expectedUsers = rawUsers(600).map((raw, index) => ({
  index,
  name: `${raw.name.first} ${raw.name.last}`,
  age: raw.dob.age,
  country: raw.location.country,
  city: raw.location.city,
}))

function renderPage(entry = '/table') {
  const router = createMemoryRouter([{ path: '/table', element: <DataTablePage /> }], {
    initialEntries: [entry],
  })
  render(<RouterProvider router={router} />)
  return router
}

function bodyNames(): string[] {
  const rows = within(screen.getByRole('table')).getAllByRole('row').slice(1)
  return rows.map((row) => within(row).getAllByRole('cell')[0].textContent ?? '')
}

function sortOf(name: string) {
  return screen.getByRole('columnheader', { name }).getAttribute('aria-sort')
}

describe('DataTablePage', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
    fetchMock.mockResolvedValue(okUsersResponse(600))
  })
  afterEach(() => {
    fetchMock.mockReset()
    vi.unstubAllGlobals()
  })

  it('loads 500+ rows and shows the first page', async () => {
    renderPage()
    expect(screen.getByText('Loading users...')).toBeInTheDocument()

    await screen.findByRole('table')
    expect(screen.getByText('Showing 1–10 of 600 results')).toBeInTheDocument()
    expect(bodyNames()).toHaveLength(10)
  })

  it('shows an error and recovers with Retry', async () => {
    fetchMock.mockReset()
    fetchMock.mockRejectedValueOnce(new Error('Network down'))
    fetchMock.mockResolvedValueOnce(okUsersResponse(600))
    renderPage()

    expect(await screen.findByRole('alert')).toHaveTextContent('Network down')
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }))
    expect(await screen.findByRole('table')).toBeInTheDocument()
  })

  it('writes sort changes to the URL and cycles back to none', async () => {
    const router = renderPage()
    await screen.findByRole('table')

    await userEvent.click(screen.getByRole('button', { name: 'Age' }))
    expect(router.state.location.search).toBe('?sort=age&dir=asc')
    await userEvent.click(screen.getByRole('button', { name: 'Age' }))
    expect(router.state.location.search).toBe('?sort=age&dir=desc')
    await userEvent.click(screen.getByRole('button', { name: 'Age' }))
    expect(router.state.location.search).toBe('')
  })

  it('restores the exact view from a shared link: sort, filter, page and page size', async () => {
    renderPage('/table?sort=age&dir=desc&f.country=India&page=3&size=10')
    await screen.findByRole('table')

    const expected = expectedUsers
      .filter((user) => user.country === 'India')
      .sort((a, b) => b.age - a.age)
      .slice(20, 30)
      .map((user) => user.name)

    expect(bodyNames()).toEqual(expected)
    expect(sortOf('Age')).toBe('descending')
    expect(screen.getByLabelText('Filter by Country')).toHaveValue('India')
    expect(screen.getByText('Page 3 of 10')).toBeInTheDocument()
    expect(screen.getByLabelText('Rows per page')).toHaveValue('10')
  })

  it('restores a shared link that has a search and a different page size', async () => {
    renderPage('/table?q=City3&sort=name&dir=desc&size=25&page=2')
    await screen.findByRole('table')

    const expected = expectedUsers
      .filter((user) => user.city === 'City3')
      .sort((a, b) => b.index - a.index)
      .slice(25, 50)
      .map((user) => user.name)

    expect(bodyNames()).toEqual(expected)
    expect(screen.getByLabelText('Search')).toHaveValue('City3')
    expect(sortOf('Name')).toBe('descending')
    expect(screen.getByText('Page 2 of 3')).toBeInTheDocument()
    expect(screen.getByLabelText('Rows per page')).toHaveValue('25')
  })

  it('goes back to page 1 when a filter changes', async () => {
    const router = renderPage('/table?page=3')
    await screen.findByRole('table')
    expect(screen.getByText('Page 3 of 60')).toBeInTheDocument()

    await userEvent.selectOptions(screen.getByLabelText('Filter by Gender'), 'Female')
    expect(screen.getByText('Page 1 of 30')).toBeInTheDocument()
    expect(router.state.location.search).toBe('?f.gender=Female')
  })

  it('goes back to page 1 when the search changes', async () => {
    const router = renderPage('/table?page=4')
    await screen.findByRole('table')

    await userEvent.type(screen.getByLabelText('Search'), 'City3')
    await waitFor(() => expect(router.state.location.search).toBe('?q=City3'))
    expect(await screen.findByText('Page 1 of 6')).toBeInTheDocument()
  })

  it('works with the browser back and forward buttons', async () => {
    const router = renderPage()
    await screen.findByRole('table')

    await userEvent.click(screen.getByRole('button', { name: 'Age' }))
    await userEvent.selectOptions(screen.getByLabelText('Filter by Country'), 'Canada')
    expect(router.state.location.search).toBe('?sort=age&dir=asc&f.country=Canada')
    expect(screen.getByText('Showing 1–10 of 100 results (filtered from 600)')).toBeInTheDocument()

    await act(async () => {
      await router.navigate(-1)
    })
    expect(router.state.location.search).toBe('?sort=age&dir=asc')
    expect(screen.getByLabelText('Filter by Country')).toHaveValue('')
    expect(screen.getByText('Showing 1–10 of 600 results')).toBeInTheDocument()

    await act(async () => {
      await router.navigate(-1)
    })
    expect(router.state.location.search).toBe('')
    expect(sortOf('Age')).toBe('none')

    await act(async () => {
      await router.navigate(2)
    })
    expect(router.state.location.search).toBe('?sort=age&dir=asc&f.country=Canada')
    expect(screen.getByLabelText('Filter by Country')).toHaveValue('Canada')
  })

  it('keeps one history entry while a search is being refined', async () => {
    const router = renderPage()
    await screen.findByRole('table')

    await userEvent.type(screen.getByLabelText('Search'), 'City1')
    await waitFor(() => expect(router.state.location.search).toBe('?q=City1'))
    expect(router.state.historyAction).toBe('PUSH')

    await userEvent.type(screen.getByLabelText('Search'), '0')
    await waitFor(() => expect(router.state.location.search).toBe('?q=City10'))
    expect(router.state.historyAction).toBe('REPLACE')

    await act(async () => {
      await router.navigate(-1)
    })
    expect(router.state.location.search).toBe('')
    expect(screen.getByLabelText('Search')).toHaveValue('')
  })

  it('shows the empty state and clears the filters from the URL', async () => {
    const router = renderPage('/table?f.country=India&q=zzzz')
    await screen.findByRole('table')
    expect(screen.getByText('No rows match your search or filters.')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Clear filters' }))
    expect(router.state.location.search).toBe('')
    expect(screen.getByText('Showing 1–10 of 600 results')).toBeInTheDocument()
  })

  it('shows the last page for a shared link whose page is out of range', async () => {
    renderPage('/table?page=999')
    await screen.findByRole('table')
    expect(screen.getByText('Page 60 of 60')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
  })
})
