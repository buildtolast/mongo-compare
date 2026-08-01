import React from 'react'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

export function Input({
  label,
  error,
  icon,
  id,
  className = '',
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-[var(--text-2)]"
        >
          {label}
        </label>
      )}
      <div className="relative rounded-md shadow-sm">
        {icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <span className="text-[var(--text-muted)] sm:text-sm">{icon}</span>
          </div>
        )}
        <input
          id={inputId}
          className={`block w-full rounded-lg border border-[var(--border)] bg-[var(--panel)] py-2 px-3 text-[var(--text)] placeholder-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-[var(--accent)] sm:text-sm ${icon ? 'pl-10' : ''} ${error ? 'border-[var(--danger)] focus:border-[var(--danger)] focus:ring-[var(--danger)]' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-[var(--danger)]">{error}</p>}
    </div>
  )
}
