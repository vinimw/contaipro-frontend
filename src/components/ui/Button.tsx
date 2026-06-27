import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

const variantClasses = {
  primary:
    "bg-[var(--color-primary)] text-[#071a3d] shadow-sm hover:bg-[var(--color-primary-strong)] hover:text-white",
  secondary:
    "bg-[var(--color-secondary)] text-[var(--color-foreground)] hover:bg-[color-mix(in_srgb,var(--color-secondary)_88%,black)]",
  ghost:
    "bg-transparent text-[var(--color-foreground)] hover:bg-[var(--color-secondary)]",
  danger: "bg-[var(--color-danger)] text-white hover:opacity-90",
};

export function buttonStyles({
  className,
  variant = "primary",
}: {
  className?: string;
  variant?: ButtonProps["variant"];
}) {
  return cn(
    "inline-flex min-h-12 cursor-pointer items-center justify-center rounded-[10px] px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
    variantClasses[variant],
    className,
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, type = "button", variant = "primary", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={buttonStyles({ className, variant })}
      {...props}
    />
  ),
);

Button.displayName = "Button";
