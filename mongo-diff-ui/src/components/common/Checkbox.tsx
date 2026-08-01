import { ChangeEvent } from 'react'

export interface CheckboxProps {
  label?: string
  checked: boolean
  onChange: (checked: boolean) => void
  id?: string
  className?: string
}

export function Checkbox({
   label,
   checked,
   onChange,
   id,
   className = '',
 }: CheckboxProps) {
  return (
    <div className="flex items-center space-x-3">
      <div className="relative flex items-center">
        <input
          id={id}
          type="checkbox"
          className={`h-5 w-5 cursor-pointer rounded border-[var(--border)] bg-[var(--panel-2)] text-[var(--accent)] focus:ring-[var(--accent)] ${className}`}
          checked={checked}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.checked)}
        />
      </div>
      {label && <label htmlFor={id} className="text-sm text-[var(--text-2)]">{label}</label>}
    </div>
  )
}
