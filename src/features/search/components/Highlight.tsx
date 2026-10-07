interface HighlightProps {
  text: string
  query: string
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export default function Highlight({ text, query }: HighlightProps) {
  const needle = query.trim()
  if (!needle) return <>{text}</>

  const parts = text.split(new RegExp(`(${escapeRegExp(needle)})`, 'i'))
  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === needle.toLowerCase() ? (
          <mark key={index} className="rounded bg-yellow-200 px-0.5">
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  )
}
