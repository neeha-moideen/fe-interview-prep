import Button from '@/components/Button/Button'
import { PAGE_SIZES, type PageSize } from '../types'

interface TablePaginationProps {
  page: number
  totalPages: number
  pageSize: PageSize
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: PageSize) => void
}

export default function TablePagination({
  page,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: TablePaginationProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
      <label className="flex items-center gap-2">
        Rows per page
        <select
          value={pageSize}
          onChange={(event) => {
            const next = PAGE_SIZES.find((size) => size === Number(event.target.value))
            if (next) onPageSizeChange(next)
          }}
          className="rounded-md border border-gray-300 px-2 py-1"
        >
          {PAGE_SIZES.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </label>
      <nav aria-label="Pagination" className="flex items-center gap-3">
        <Button
          variant="secondary"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <span>
          Page {page} of {totalPages}
        </span>
        <Button
          variant="secondary"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </nav>
    </div>
  )
}
