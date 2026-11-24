import type { ComponentProps } from "react"
import { Label } from "@/shared/label"
import { Textarea as ShadcnTextarea } from "@/shared/textarea"
import { cn } from "@/utils/cn"

interface TextareaProps extends ComponentProps<typeof ShadcnTextarea> {
  id: string
  label: string
  error?: string
  helperText?: string
  characterCount?: { current: number; max: number }
}

export function Textarea({
  id,
  label,
  error,
  helperText,
  characterCount,
  required,
  className,
  ...props
}: TextareaProps) {
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

      <ShadcnTextarea
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
