import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Highlight from './Highlight'

function marks(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll('mark'), (mark) => mark.textContent ?? '')
}

describe('Highlight', () => {
  it('wraps every case-insensitive match in a mark', () => {
    const { container } = render(<Highlight text="React and react again" query="react" />)
    expect(marks(container)).toEqual(['React', 'react'])
  })

  it('renders plain text for an empty query', () => {
    const { container } = render(<Highlight text="Nothing here" query="  " />)
    expect(marks(container)).toEqual([])
    expect(container).toHaveTextContent('Nothing here')
  })

  it('treats regex characters in the query literally', () => {
    const { container } = render(<Highlight text="Price (new) $5" query="(new)" />)
    expect(marks(container)).toEqual(['(new)'])
  })
})
