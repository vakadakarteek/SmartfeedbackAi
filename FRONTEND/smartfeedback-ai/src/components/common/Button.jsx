import { Loader2 } from 'lucide-react'
import clsx from 'clsx'

const variants = {
  primary:   'btn-primary',
  secondary: 'btn-secondary',
  danger:    'btn-danger',
  ghost:     'btn-ghost',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: '',          // default from class
  lg: 'px-5 py-3 text-base',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  disabled,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={clsx(variants[variant], size !== 'md' && sizes[size], className)}
      {...props}
    >
      {loading ? (
        <Loader2 size={15} className="animate-spin flex-shrink-0" />
      ) : (
        Icon && iconPosition === 'left' && <Icon size={15} className="flex-shrink-0" />
      )}
      {children}
      {!loading && Icon && iconPosition === 'right' && (
        <Icon size={15} className="flex-shrink-0" />
      )}
    </button>
  )
}
