import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { DEFAULT_VIEW, reduceView } from '../tableView'
import type { Column, TableAction, TableView } from '../types'
import DataTable from './DataTable'

interface Product {
  sku: string
  title: string
  price: number
  category: string
}

const products: Product[] = Array.from({ length: 120 }, (_, index) => ({
  sku: `SKU-${index + 1}`,
  title: `Product ${index + 1}`,
  price: ((index * 37) % 100) + 1,
  category: ['Toys', 'Books', 'Games'][index % 3],
}))

const columns: Column<Product>[] = [
  { id: 'title', header: 'Title', accessor: (product) => product.title },
  {
    id: 'price',
    header: 'Price',
    accessor: (product) => product.price,
    cell: (product) => `$${product.price}`,
    align: 'right',
  },
  { id: 'category', header: 'Category', accessor: (product) => product.category, filterable: true },
  { id: 'sku', header: 'SKU', accessor: (product) => product.sku, sortable: false },
]

function Harness() {
  const [view, setView] = useState<TableView>(DEFAULT_VIEW)
  const onAction = (action: TableAction) => setView((current) => reduceView(current, action))
  return (
    <DataTable
      rows={products}
      columns={columns}
      getRowId={(product) => product.sku}
      view={view}
      onAction={onAction}
      caption="Products"
    />
  )
}

function bodyRows() {
  return within(screen.getByRole('table')).getAllByRole('row').slice(1)
}

function firstCells(index = 0) {
  return bodyRows().map((row) => within(row).getAllByRole('cell')[index].textContent)
}

describe('DataTable', () => {
  it('builds its headers and cells from the column definitions', () => {
    render(<Harness />)

    const headers = screen.getAllByRole('columnheader').map((header) => header.textContent)
    expect(headers.map((text) => text?.replace(/[↑↓↕]/g, '').trim())).toEqual([
      'Title',
      'Price',
      'Category',
      'SKU',
    ])
    expect(bodyRows()).toHaveLength(10)
    expect(firstCells(1)[0]).toBe('$1')
    expect(screen.getByText('Showing 1–10 of 120 results')).toBeInTheDocument()
  })

  it('gives only sortable columns a sort button', () => {
    render(<Harness />)
    expect(screen.getByRole('button', { name: 'Title' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'SKU' })).not.toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'SKU' })).not.toHaveAttribute('aria-sort')
  })

  it('cycles ascending, descending and none when a header is clicked', async () => {
    render(<Harness />)
    const header = screen.getByRole('columnheader', { name: 'Price' })
    expect(header).toHaveAttribute('aria-sort', 'none')

    await userEvent.click(screen.getByRole('button', { name: 'Price' }))
    expect(header).toHaveAttribute('aria-sort', 'ascending')
    expect(firstCells(1)[0]).toBe('$1')

    await userEvent.click(screen.getByRole('button', { name: 'Price' }))
    expect(header).toHaveAttribute('aria-sort', 'descending')
    expect(firstCells(1)[0]).toBe('$100')

    await userEvent.click(screen.getByRole('button', { name: 'Price' }))
    expect(header).toHaveAttribute('aria-sort', 'none')
    expect(firstCells()[0]).toBe('Product 1')
  })

  it('offers page sizes of 10, 25 and 50', async () => {
    render(<Harness />)
    const select = screen.getByLabelText('Rows per page')
    const options = within(select).getAllByRole('option').map((option) => option.textContent)
    expect(options).toEqual(['10', '25', '50'])

    await userEvent.selectOptions(select, '25')
    expect(bodyRows()).toHaveLength(25)
    expect(screen.getByText('Page 1 of 5')).toBeInTheDocument()
  })

  it('moves between pages and disables the buttons at the ends', async () => {
    render(<Harness />)
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled()

    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(screen.getByText('Page 2 of 12')).toBeInTheDocument()
    expect(firstCells()[0]).toBe('Product 11')

    await userEvent.selectOptions(screen.getByLabelText('Rows per page'), '50')
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(screen.getByText('Page 3 of 3')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
    expect(bodyRows()).toHaveLength(20)
  })

  it('narrows rows with a column filter and returns to page 1', async () => {
    render(<Harness />)
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(screen.getByText('Page 2 of 12')).toBeInTheDocument()

    await userEvent.selectOptions(screen.getByLabelText('Filter by Category'), 'Books')
    expect(screen.getByText('Page 1 of 4')).toBeInTheDocument()
    expect(screen.getByText('Showing 1–10 of 40 results (filtered from 120)')).toBeInTheDocument()
  })

  it('searches every column after the user pauses typing', async () => {
    render(<Harness />)
    await userEvent.type(screen.getByLabelText('Search'), 'toys')

    expect(
      await screen.findByText('Showing 1–10 of 40 results (filtered from 120)'),
    ).toBeInTheDocument()
  })

  it('shows an empty state and restores the rows when filters are cleared', async () => {
    render(<Harness />)
    await userEvent.type(screen.getByLabelText('Search'), 'zzzz')
    expect(await screen.findByText('No rows match your search or filters.')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Clear filters' }))
    expect(await screen.findByText('Showing 1–10 of 120 results')).toBeInTheDocument()
    expect(screen.getByLabelText('Search')).toHaveValue('')
  })
})
