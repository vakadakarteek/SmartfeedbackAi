import clsx from 'clsx'
import { forwardRef } from 'react'

const Input = forwardRef(function Input(
  { label, error, hint, required, className = '', wrapperClassName = '', icon: Icon, ...props },
  ref
) {
  return (
    <div className={clsx('w-full', wrapperClassName)}>
      {label && (
        <label className="label">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <Icon size={15} />
          </span>
        )}
        <input
          ref={ref}
          className={clsx(
            'input-base',
            Icon && 'pl-9',
            error && 'input-error',
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${props.id || props.name}-error` : undefined}
          {...props}
        />
      </div>
      {error && (
        <p
          id={`${props.id || props.name}-error`}
          className="mt-1.5 text-xs text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="mt-1.5 text-xs text-slate-400">{hint}</p>
      )}
    </div>
  )
})

export default Input
