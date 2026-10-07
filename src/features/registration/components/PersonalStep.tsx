import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { personalSchema, type PersonalInfo } from '../schemas'
import { useDraftSync } from '../useDraftSync'
import Field from './Field'
import StepActions from './StepActions'
import { INPUT_CLASS } from './styles'

interface PersonalStepProps {
  defaults: PersonalInfo
  onDraft: (values: PersonalInfo) => void
  onNext: (values: PersonalInfo) => void
}

export default function PersonalStep({ defaults, onDraft, onNext }: PersonalStepProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PersonalInfo>({
    defaultValues: defaults,
    resolver: zodResolver(personalSchema),
    mode: 'onTouched',
  })
  useDraftSync(watch, onDraft)

  return (
    <form onSubmit={handleSubmit(onNext)} noValidate className="space-y-4">
      <Field label="Full name" htmlFor="name" error={errors.name?.message}>
        <input
          id="name"
          autoComplete="name"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'name-error' : undefined}
          className={INPUT_CLASS}
          {...register('name')}
        />
      </Field>
      <Field label="Email" htmlFor="email" error={errors.email?.message}>
        <input
          id="email"
          type="email"
          autoComplete="email"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
          className={INPUT_CLASS}
          {...register('email')}
        />
      </Field>
      <Field label="Phone" htmlFor="phone" error={errors.phone?.message}>
        <input
          id="phone"
          type="tel"
          autoComplete="tel"
          aria-invalid={!!errors.phone}
          aria-describedby={errors.phone ? 'phone-error' : undefined}
          className={INPUT_CLASS}
          {...register('phone')}
        />
      </Field>
      <StepActions nextLabel="Next" />
    </form>
  )
}
