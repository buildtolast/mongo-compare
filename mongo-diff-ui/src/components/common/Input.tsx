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
          className="block text-sm font-medium text-slate-300"
        >
          {label}
        </label>
      )}
      <div className="relative rounded-md shadow-sm">
        {icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <span className="text-slate-400 sm:text-sm">{icon}</span>
          </div>
        )}
        <input
          id={inputId}
          className={`block w-full rounded-lg border border-slate-600 bg-slate-800 py-2 px-3 text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm ${icon ? 'pl-10' : ''} ${error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-rose-400">{error}</p>}
    </div>
  )
}
