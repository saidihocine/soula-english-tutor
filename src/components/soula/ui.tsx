import type { ButtonHTMLAttributes, InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const buttonStyles = {
  primary: "bg-terra text-cream hover:bg-terra-deep",
  quiet: "border border-line bg-cream text-ink hover:bg-sand",
  leaf: "bg-leaf text-cream",
  ghost: "bg-transparent text-ink hover:bg-cream",
} as const;

export function Button({
  variant = "primary",
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof buttonStyles }) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-base font-semibold transition-colors duration-200 disabled:opacity-50",
        buttonStyles[variant],
        className,
      )}
      {...props}
    />
  );
}

export function Field({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "min-h-12 w-full rounded-full border border-line bg-cream px-4 text-base text-ink placeholder:text-muted",
        className,
      )}
      {...props}
    />
  );
}

export function Stars({ count }: { count: number }) {
  return (
    <p className="tabular-nums text-sm font-semibold text-terra">
      {count} {count === 1 ? "نجمة" : "نجوم"}
    </p>
  );
}
