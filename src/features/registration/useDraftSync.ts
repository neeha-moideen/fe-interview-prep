import { useEffect } from 'react'
import type { FieldValues, UseFormWatch } from 'react-hook-form'

export function useDraftSync<T extends FieldValues>(
  watch: UseFormWatch<T>,
  onDraft: (values: T) => void,
) {
  useEffect(() => {
    const subscription = watch((values) => onDraft(values as T))
    return () => subscription.unsubscribe()
  }, [watch, onDraft])
}
