import type { Column } from '@/features/table/types'
import type { UserRow } from './types'

export const userColumns: Column<UserRow>[] = [
  { id: 'name', header: 'Name', accessor: (user) => user.name },
  { id: 'email', header: 'Email', accessor: (user) => user.email },
  { id: 'gender', header: 'Gender', accessor: (user) => user.gender, filterable: true },
  { id: 'country', header: 'Country', accessor: (user) => user.country, filterable: true },
  { id: 'city', header: 'City', accessor: (user) => user.city },
  { id: 'age', header: 'Age', accessor: (user) => user.age, align: 'right' },
]
