import type { ComponentProps, ReactNode } from "react"
import { Spinner } from "@/components/Shared/Spinner"
import { Button as ShadcnButton } from "@/shared/button"
import { cn } from "@/utils/cn"

type ButtonVariant = "primary" | "secondary" | "danger" | "danger-ghost" | "ghost"
type ButtonSize = "sm" | "md"

interface ButtonProps extends Omit<ComponentProps<typeof ShadcnButton>, "variant" | "size"> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  loadingText?: string
  children: ReactNode
}

const variantMap: Record<
  ButtonVariant,
  {
    shadcnVariant: ComponentProps<typeof ShadcnButton>["variant"]
    extraClassName?: string
  }
> = {
  primary: { shadcnVariant: "default" },
  secondary: { shadcnVariant: "outline" },
  danger: { shadcnVariant: "destructive" },
  "danger-ghost": {
    shadcnVariant: "ghost",
    extraClassName: "text-red-600 hover:bg-red-50 hover:text-red-700 focus-visible:ring-red-600/30"
  },
  ghost: { shadcnVariant: "ghost" }
}

const sizeMap: Record<ButtonSize, ComponentProps<typeof ShadcnButton>["size"]> = {
  sm: "sm",
  md: "default"
}

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  loadingText,
  disabled,
  className,
  type = "button",
  asChild = false,
  children,
  ...props
}: ButtonProps) {
  const { shadcnVariant, extraClassName } = variantMap[variant]

  if (asChild) {
    return (
      <ShadcnButton
        asChild
        variant={shadcnVariant}
        size={sizeMap[size]}
        className={cn(extraClassName, className)}
        {...props}>
        {children}
      </ShadcnButton>
    )
  }

  return (
    <ShadcnButton
      type={type}
      variant={shadcnVariant}
      size={sizeMap[size]}
      disabled={disabled || isLoading}
      className={cn(extraClassName, className)}
      {...props}>
      {isLoading && <Spinner size="sm" />}
      {isLoading && loadingText ? <span>{loadingText}</span> : children}
    </ShadcnButton>
  )
}
