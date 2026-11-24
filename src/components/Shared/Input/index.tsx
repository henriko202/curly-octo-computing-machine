import type { ComponentProps } from "react"
import { Input as ShadcnInput } from "@/shared/input"
import { Label } from "@/shared/label"
import { cn } from "@/utils/cn"

interface InputProps extends ComponentProps<typeof ShadcnInput> {
  id: string
  label: string
  error?: string
  helperText?: string
  characterCount?: { current: number; max: number }
}

export function Input({ id, label, error, helperText, characterCount, required, className, ...props }: InputProps) {
  const errorId = `${id}-error`
  const helperId = `${id}-helper`
  const describedBy = error ? errorId : helperText ? helperId : undefined

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id}>
          {label}
          {required && (
            <span
              className="text-red-600"
              aria-hidden="true">
              *
            </span>
          )}
        </Label>
        {characterCount && (
          <span
            className={cn(
              "text-xs",
              characterCount.current > characterCount.max ? "font-medium text-red-600" : "text-slate-400"
            )}>
            {characterCount.current}/{characterCount.max}
          </span>
        )}
      </div>

      <ShadcnInput
        id={id}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={className}
        {...props}
      />

      {error ? (
        <p
          id={errorId}
          role="alert"
          className="text-xs font-medium text-red-600">
          {error}
        </p>
      ) : helperText ? (
        <p
          id={helperId}
          className="text-xs text-slate-500">
          {helperText}
        </p>
      ) : null}
    </div>
  )
}
