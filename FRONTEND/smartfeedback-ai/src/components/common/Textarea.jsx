import clsx from 'clsx'
import { forwardRef } from 'react'

const Textarea = forwardRef(function Textarea(
  { label, error, hint, required, className = '', wrapperClassName = '', showCount = false, maxLength, value = '', ...props },
  ref
) {
  return (
    <div className={clsx('w-full', wrapperClassName)}>
      {label && (
        <div className="flex items-center justify-between mb-1.5">
          <label className="label mb-0">
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
          {showCount && maxLength && (
            <span className="text-xs text-slate-400">
              {String(value).length}/{maxLength}
            </span>
          )}
        </div>
      )}
      <textarea
        ref={ref}
        value={value}
        maxLength={maxLength}
        className={clsx(
          'input-base resize-none',
          error && 'input-error',
          className
        )}
        aria-invalid={!!error}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-xs text-red-600" role="alert">{error}</p>
      )}
      {hint && !error && (
        <p className="mt-1.5 text-xs text-slate-400">{hint}</p>
      )}
    </div>
  )
})

export default Textarea
