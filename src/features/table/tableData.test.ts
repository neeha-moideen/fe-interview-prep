import { describe, expect, it } from 'vitest'
import { computeTable, distinctValues } from './tableData'
import { DEFAULT_VIEW } from './tableView'
import type { Column, TableView } from './types'

interface Person {
  id: number
  name: string
  age: number
  country: string
  note: string
}

const people: Person[] = [
  { id: 1, name: 'Ann Lee', age: 100, country: 'India', note: 'zzz' },
  { id: 2, name: 'bob stone', age: 9, country: 'Canada', note: 'yyy' },
  { id: 3, name: 'Cara Item10', age: 10, country: 'India', note: 'xxx' },
  { id: 4, name: 'Dan Item2', age: 10, country: 'Canada', note: 'www' },
]

const columns: Column<Person>[] = [
  { id: 'name', header: 'Name', accessor: (person) => person.name },
  { id: 'age', header: 'Age', accessor: (person) => person.age },
  { id: 'country', header: 'Country', accessor: (person) => person.country, filterable: true },
  { id: 'note', header: 'Note', accessor: (person) => person.note, searchable: false },
]

function ids(view: Partial<TableView>, source: readonly Person[] = people): number[] {
  return computeTable(source, columns, { ...DEFAULT_VIEW, ...view }).rows.map((person) => person.id)
}

describe('computeTable: sorting', () => {
  it('keeps the original order when there is no sort', () => {
    expect(ids({})).toEqual([1, 2, 3, 4])
  })

  it('sorts numbers by value, not as text', () => {
    expect(ids({ sort: { columnId: 'age', direction: 'asc' } })).toEqual([2, 3, 4, 1])
    expect(ids({ sort: { columnId: 'age', direction: 'desc' } })).toEqual([1, 3, 4, 2])
  })

  it('sorts text ignoring case', () => {
    expect(ids({ sort: { columnId: 'name', direction: 'asc' } })).toEqual([1, 2, 3, 4])
    expect(ids({ sort: { columnId: 'name', direction: 'desc' } })).toEqual([4, 3, 2, 1])
  })

  it('treats digits inside text as numbers', () => {
    const items: Person[] = [
      { id: 1, name: 'item10', age: 0, country: '', note: '' },
      { id: 2, name: 'Item2', age: 0, country: '', note: '' },
      { id: 3, name: 'item1', age: 0, country: '', note: '' },
    ]
    expect(ids({ sort: { columnId: 'name', direction: 'asc' } }, items)).toEqual([3, 2, 1])
    expect(ids({ sort: { columnId: 'name', direction: 'desc' } }, items)).toEqual([1, 2, 3])
  })

  it('keeps tied rows in their original order', () => {
    expect(ids({ sort: { columnId: 'age', direction: 'asc' } }).slice(1, 3)).toEqual([3, 4])
  })

  it('ignores a sort on an unknown column', () => {
    expect(ids({ sort: { columnId: 'missing', direction: 'asc' } })).toEqual([1, 2, 3, 4])
  })
})

describe('computeTable: search', () => {
  it('matches case-insensitively across searchable columns', () => {
    expect(ids({ search: 'BOB' })).toEqual([2])
    expect(ids({ search: 'india' })).toEqual([1, 3])
  })

  it('requires every word to match somewhere in the row', () => {
    expect(ids({ search: 'ann india' })).toEqual([1])
    expect(ids({ search: 'ann canada' })).toEqual([])
  })

  it('does not search columns marked searchable: false', () => {
    expect(ids({ search: 'zzz' })).toEqual([])
  })

  it('ignores blank searches', () => {
    expect(ids({ search: '   ' })).toEqual([1, 2, 3, 4])
  })
})

describe('computeTable: filters', () => {
  it('keeps rows whose value equals the filter', () => {
    expect(ids({ filters: { country: 'India' } })).toEqual([1, 3])
  })

  it('ignores filters for unknown or non-filterable columns', () => {
    expect(ids({ filters: { missing: 'x' } })).toEqual([1, 2, 3, 4])
    expect(ids({ filters: { name: 'Ann Lee' } })).toEqual([1, 2, 3, 4])
  })

  it('combines filter, search and sort', () => {
    expect(
      ids({
        filters: { country: 'India' },
        search: 'item',
        sort: { columnId: 'age', direction: 'desc' },
      }),
    ).toEqual([3])
  })
})

describe('computeTable: pagination', () => {
  const many: Person[] = Array.from({ length: 55 }, (_, index) => ({
    id: index + 1,
    name: `Person ${index + 1}`,
    age: index,
    country: 'India',
    note: '',
  }))

  it('slices the requested page', () => {
    const result = computeTable(many, columns, { ...DEFAULT_VIEW, page: 2, pageSize: 25 })
    expect(result.rows.map((person) => person.id)).toEqual(
      Array.from({ length: 25 }, (_, index) => index + 26),
    )
    expect(result).toMatchObject({ page: 2, totalPages: 3, firstItem: 26, lastItem: 50, matchCount: 55 })
  })

  it('shows a short last page', () => {
    const result = computeTable(many, columns, { ...DEFAULT_VIEW, page: 3, pageSize: 25 })
    expect(result.rows).toHaveLength(5)
    expect(result).toMatchObject({ firstItem: 51, lastItem: 55 })
  })

  it('clamps a page past the end to the last page', () => {
    expect(computeTable(many, columns, { ...DEFAULT_VIEW, page: 99 }).page).toBe(6)
  })

  it('reports an empty result as page 1 of 1', () => {
    const result = computeTable(many, columns, { ...DEFAULT_VIEW, search: 'nobody', page: 4 })
    expect(result).toMatchObject({ rows: [], matchCount: 0, page: 1, totalPages: 1, firstItem: 0, lastItem: 0 })
  })
})

describe('distinctValues', () => {
  it('returns the unique values sorted', () => {
    expect(distinctValues(people, columns[2])).toEqual(['Canada', 'India'])
  })
})
