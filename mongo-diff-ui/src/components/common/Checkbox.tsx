import { ChangeEvent } from 'react'

export interface CheckboxProps {
  label?: string
  checked: boolean
  onChange: (checked: boolean) => void
  className?: string
}

export function Checkbox({
  label,
  checked,
  onChange,
  className = '',
  ...props
}: CheckboxProps) {
  return (
    <div className="flex items-center space-x-3">
      <div className="relative flex items-center">
        <input
          type="checkbox"
          className={`h-5 w-5 cursor-pointer rounded border-slate-600 bg-slate-700 text-emerald-600 focus:ring-emerald-500 ${className}`}
          checked={checked}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.checked)}
        />
      </div>
      {label && <span className="text-sm text-slate-300">{label}</span>}
    </div>
  )
}
