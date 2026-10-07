import { describe, expect, it } from 'vitest'
import { DEFAULT_VIEW, parseView, reduceView, serializeView } from './tableView'
import type { ColumnMeta, TableView } from './types'

const columns: ColumnMeta[] = [
  { id: 'name' },
  { id: 'age' },
  { id: 'country', filterable: true },
  { id: 'notes', sortable: false },
]

function parse(query: string): TableView {
  return parseView(new URLSearchParams(query), columns)
}

describe('reduceView: sorting', () => {
  it('cycles ascending, descending, none on the same column', () => {
    let view = reduceView(DEFAULT_VIEW, { type: 'sort', columnId: 'age' })
    expect(view.sort).toEqual({ columnId: 'age', direction: 'asc' })
    view = reduceView(view, { type: 'sort', columnId: 'age' })
    expect(view.sort).toEqual({ columnId: 'age', direction: 'desc' })
    view = reduceView(view, { type: 'sort', columnId: 'age' })
    expect(view.sort).toBeNull()
  })

  it('starts a different column at ascending', () => {
    const sorted = reduceView(DEFAULT_VIEW, { type: 'sort', columnId: 'age' })
    const desc = reduceView(sorted, { type: 'sort', columnId: 'age' })
    expect(reduceView(desc, { type: 'sort', columnId: 'name' }).sort).toEqual({
      columnId: 'name',
      direction: 'asc',
    })
  })
})

describe('reduceView: going back to page 1', () => {
  const onPageFive: TableView = { ...DEFAULT_VIEW, page: 5 }

  it.each([
    ['a filter changes', { type: 'filter', columnId: 'country', value: 'India' } as const],
    ['the search changes', { type: 'search', value: 'ann' } as const],
    ['the sort changes', { type: 'sort', columnId: 'age' } as const],
    ['the page size changes', { type: 'pageSize', pageSize: 25 } as const],
    ['filters are cleared', { type: 'clearFilters' } as const],
  ])('resets to page 1 when %s', (_label, action) => {
    expect(reduceView(onPageFive, action).page).toBe(1)
  })

  it('moves to the requested page and never below 1', () => {
    expect(reduceView(DEFAULT_VIEW, { type: 'page', page: 4 }).page).toBe(4)
    expect(reduceView(DEFAULT_VIEW, { type: 'page', page: 0 }).page).toBe(1)
    expect(reduceView(DEFAULT_VIEW, { type: 'page', page: -3 }).page).toBe(1)
  })
})

describe('reduceView: filters', () => {
  it('sets, replaces and removes a column filter', () => {
    let view = reduceView(DEFAULT_VIEW, { type: 'filter', columnId: 'country', value: 'India' })
    expect(view.filters).toEqual({ country: 'India' })
    view = reduceView(view, { type: 'filter', columnId: 'country', value: 'Canada' })
    expect(view.filters).toEqual({ country: 'Canada' })
    view = reduceView(view, { type: 'filter', columnId: 'country', value: '' })
    expect(view.filters).toEqual({})
  })

  it('clearFilters clears search and filters but keeps sort and page size', () => {
    const view: TableView = {
      search: 'ann',
      sort: { columnId: 'age', direction: 'desc' },
      filters: { country: 'India' },
      page: 3,
      pageSize: 25,
    }
    expect(reduceView(view, { type: 'clearFilters' })).toEqual({
      search: '',
      sort: { columnId: 'age', direction: 'desc' },
      filters: {},
      page: 1,
      pageSize: 25,
    })
  })
})

describe('parseView', () => {
  it('returns the default view for an empty query', () => {
    expect(parse('')).toEqual(DEFAULT_VIEW)
  })

  it('reads every part of the view', () => {
    expect(parse('q=ann+lee&sort=age&dir=desc&f.country=India&page=3&size=25')).toEqual({
      search: 'ann lee',
      sort: { columnId: 'age', direction: 'desc' },
      filters: { country: 'India' },
      page: 3,
      pageSize: 25,
    })
  })

  it('ignores an unknown or non-sortable sort column', () => {
    expect(parse('sort=missing&dir=desc').sort).toBeNull()
    expect(parse('sort=notes').sort).toBeNull()
  })

  it('defaults the direction to ascending', () => {
    expect(parse('sort=age').sort).toEqual({ columnId: 'age', direction: 'asc' })
    expect(parse('sort=age&dir=sideways').sort).toEqual({ columnId: 'age', direction: 'asc' })
  })

  it.each(['0', 'abc', '-1', '2.5', ''])('falls back to page 1 for page=%j', (page) => {
    expect(parse(`page=${page}`).page).toBe(1)
  })

  it.each(['30', '0', 'abc', ''])('falls back to the default page size for size=%j', (size) => {
    expect(parse(`size=${size}`).pageSize).toBe(10)
  })

  it('only reads filters for filterable columns', () => {
    expect(parse('f.country=India&f.name=Ann').filters).toEqual({ country: 'India' })
  })
})

describe('serializeView', () => {
  it('writes nothing for the default view', () => {
    expect(serializeView(DEFAULT_VIEW, columns).toString()).toBe('')
  })

  it('writes the parts in a stable order', () => {
    const view: TableView = {
      search: 'ann lee',
      sort: { columnId: 'age', direction: 'desc' },
      filters: { country: 'India' },
      page: 3,
      pageSize: 25,
    }
    expect(serializeView(view, columns).toString()).toBe(
      'q=ann+lee&sort=age&dir=desc&f.country=India&page=3&size=25',
    )
  })

  it.each([
    DEFAULT_VIEW,
    { ...DEFAULT_VIEW, search: 'a&b=c d', page: 2 },
    { ...DEFAULT_VIEW, sort: { columnId: 'name', direction: 'asc' as const }, pageSize: 50 as const },
    { ...DEFAULT_VIEW, filters: { country: 'United Kingdom' }, page: 9 },
  ])('round-trips %j', (view) => {
    expect(parseView(serializeView(view, columns), columns)).toEqual(view)
  })
})
