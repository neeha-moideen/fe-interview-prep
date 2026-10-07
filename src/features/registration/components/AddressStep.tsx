import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { COUNTRIES, addressSchema, type Address } from '../schemas'
import { useDraftSync } from '../useDraftSync'
import Field from './Field'
import StepActions from './StepActions'
import { INPUT_CLASS } from './styles'

interface AddressStepProps {
  defaults: Address
  onDraft: (values: Address) => void
  onNext: (values: Address) => void
  onBack: () => void
}

export default function AddressStep({ defaults, onDraft, onNext, onBack }: AddressStepProps) {
  const {
    register,
    handleSubmit,
    watch,
    control,
    trigger,
    getFieldState,
    formState: { errors },
  } = useForm<Address>({
    defaultValues: defaults,
    resolver: zodResolver(addressSchema),
    mode: 'onTouched',
  })
  useDraftSync(watch, onDraft)

  const country = useWatch({ control, name: 'country' })
  useEffect(() => {
    const { error, isTouched } = getFieldState('postalCode')
    if (error || isTouched) void trigger('postalCode')
  }, [country, getFieldState, trigger])

  return (
    <form onSubmit={handleSubmit(onNext)} noValidate className="space-y-4">
      <Field label="Country" htmlFor="country" error={errors.country?.message}>
        <select
          id="country"
          aria-invalid={!!errors.country}
          aria-describedby={errors.country ? 'country-error' : undefined}
          className={INPUT_CLASS}
          {...register('country')}
        >
          <option value="">Select a country</option>
          {COUNTRIES.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="City" htmlFor="city" error={errors.city?.message}>
        <input
          id="city"
          autoComplete="address-level2"
          aria-invalid={!!errors.city}
          aria-describedby={errors.city ? 'city-error' : undefined}
          className={INPUT_CLASS}
          {...register('city')}
        />
      </Field>
      <Field label="Postal code" htmlFor="postalCode" error={errors.postalCode?.message}>
        <input
          id="postalCode"
          autoComplete="postal-code"
          aria-invalid={!!errors.postalCode}
          aria-describedby={errors.postalCode ? 'postalCode-error' : undefined}
          className={INPUT_CLASS}
          {...register('postalCode')}
        />
      </Field>
      <StepActions nextLabel="Next" onBack={onBack} />
    </form>
  )
}
