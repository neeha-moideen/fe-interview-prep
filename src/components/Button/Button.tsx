import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-white shadow-xs hover:bg-primary-hover active:bg-primary-dark',
        secondary: 'border border-primary bg-white text-primary hover:bg-primary-light active:bg-primary-subtle',
        ghost: 'text-primary hover:bg-primary-light active:bg-primary-subtle',
        danger: 'text-error hover:bg-error-bg',
      },
      size: {
        md: 'px-4 py-2 text-sm',
        sm: 'px-2 py-1 text-sm',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export default function Button({ variant, size, className, type = 'button', ...props }: ButtonProps) {
  return (
    <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  )
}
