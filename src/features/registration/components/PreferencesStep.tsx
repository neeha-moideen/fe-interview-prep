import { zodResolver } from '@hookform/resolvers/zod'
import { useState, type KeyboardEvent } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import Button from '@/components/Button/Button'
import { PLANS, preferencesSchema, type Preferences } from '../schemas'
import { useDraftSync } from '../useDraftSync'
import StepActions from './StepActions'
import { INPUT_CLASS } from './styles'

interface PreferencesStepProps {
  defaults: Preferences
  onDraft: (values: Preferences) => void
  onNext: (values: Preferences) => void
  onBack: () => void
}

export default function PreferencesStep({
  defaults,
  onDraft,
  onNext,
  onBack,
}: PreferencesStepProps) {
  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors },
  } = useForm<Preferences>({
    defaultValues: defaults,
    resolver: zodResolver(preferencesSchema),
    mode: 'onTouched',
  })
  useDraftSync(watch, onDraft)

  const [skillInput, setSkillInput] = useState('')
  const skills = useWatch({ control, name: 'skills' }) ?? []

  function updateSkills(next: string[]) {
    setValue('skills', next, { shouldValidate: true, shouldDirty: true, shouldTouch: true })
  }

  function addSkill() {
    const skill = skillInput.trim()
    if (!skill) return
    const exists = skills.some((existing) => existing.toLowerCase() === skill.toLowerCase())
    if (!exists) updateSkills([...skills, skill])
    setSkillInput('')
  }

  function handleSkillKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter') return
    event.preventDefault()
    addSkill()
  }

  return (
    <form onSubmit={handleSubmit(onNext)} noValidate className="space-y-4">
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Plan</legend>
        <div className="flex gap-4">
          {PLANS.map((plan) => (
            <label key={plan.value} className="flex items-center gap-2 text-sm">
              <input type="radio" value={plan.value} {...register('plan')} />
              {plan.label}
            </label>
          ))}
        </div>
        {errors.plan && <p className="text-sm text-error">{errors.plan.message}</p>}
      </fieldset>

      <div className="space-y-2">
        <label htmlFor="skill" className="block text-sm font-medium">
          Skills
        </label>
        <div className="flex gap-2">
          <input
            id="skill"
            value={skillInput}
            onChange={(event) => setSkillInput(event.target.value)}
            onKeyDown={handleSkillKeyDown}
            placeholder="e.g. React"
            aria-invalid={!!errors.skills}
            aria-describedby={errors.skills ? 'skills-error' : undefined}
            className={INPUT_CLASS}
          />
          <Button variant="secondary" onClick={addSkill}>
            Add skill
          </Button>
        </div>
        {skills.length > 0 && (
          <ul aria-label="Selected skills" className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <li
                key={skill}
                className="flex items-center gap-1 rounded-full bg-primary-light px-3 py-1 text-sm text-primary-hover"
              >
                {skill}
                <button
                  type="button"
                  aria-label={`Remove ${skill}`}
                  onClick={() => updateSkills(skills.filter((existing) => existing !== skill))}
                  className="px-1 font-medium"
                >
                  x
                </button>
              </li>
            ))}
          </ul>
        )}
        {errors.skills && (
          <p id="skills-error" className="text-sm text-error">
            {errors.skills.message}
          </p>
        )}
      </div>

      <StepActions nextLabel="Review" onBack={onBack} />
    </form>
  )
}
