import { AlertCircle, CheckCircle2, Info } from "lucide-react"
import type { ReactNode } from "react"
import { cn } from "@/utils"

type AlertVariant = "error" | "success" | "info"

interface AlertProps {
  variant?: AlertVariant
  title?: string
  children: ReactNode
  action?: ReactNode
  className?: string
}

const variantStyles: Record<AlertVariant, { container: string; icon: typeof AlertCircle; iconClass: string }> = {
  error: {
    container: "border-red-200 bg-red-50 text-red-900",
    icon: AlertCircle,
    iconClass: "text-red-600"
  },
  success: {
    container: "border-emerald-200 bg-emerald-50 text-emerald-900",
    icon: CheckCircle2,
    iconClass: "text-emerald-600"
  },
  info: {
    container: "border-slate-200 bg-slate-100 text-slate-800",
    icon: Info,
    iconClass: "text-slate-600"
  }
}

export function Alert({ variant = "info", title, children, action, className }: AlertProps) {
  const { container, icon: Icon, iconClass } = variantStyles[variant]

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm",
        container,
        className
      )}>
      <div className="flex items-start gap-2.5">
        <Icon
          aria-hidden="true"
          className={cn("mt-0.5 h-4 w-4 shrink-0", iconClass)}
        />
        <div className="space-y-0.5">
          {title && <p className="font-semibold">{title}</p>}
          <div>{children}</div>
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
