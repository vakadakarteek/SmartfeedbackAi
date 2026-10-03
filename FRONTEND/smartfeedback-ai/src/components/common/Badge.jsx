import clsx from 'clsx'

const variants = {
  green:  'badge-green',
  blue:   'badge-blue',
  orange: 'badge-orange',
  red:    'badge-red',
  slate:  'badge-slate',
}

export default function Badge({ children, variant = 'slate', dot = false, className = '' }) {
  return (
    <span className={clsx(variants[variant], className)}>
      {dot && (
        <span
          className={clsx('w-1.5 h-1.5 rounded-full', {
            'bg-green-500':  variant === 'green',
            'bg-blue-500':   variant === 'blue',
            'bg-orange-500': variant === 'orange',
            'bg-red-500':    variant === 'red',
            'bg-slate-400':  variant === 'slate',
          })}
        />
      )}
      {children}
    </span>
  )
}
