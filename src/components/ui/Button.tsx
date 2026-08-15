import { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline";
}

export default function Button({
  children,
  variant = "primary",
  className,
  ...props
}: ButtonProps) {
  const variants = {
    primary:
      "bg-[#14532D] text-white hover:bg-[#166534]",

    secondary:
      "bg-[#166534] text-white hover:bg-[#14532D]",

    outline:
      "border border-[#14532D] text-[#14532D] hover:bg-green-50",
  };

  return (
    <button
      {...props}
      className={clsx(
        "inline-flex items-center justify-center rounded-xl px-5 py-3 font-medium transition disabled:opacity-50",
        variants[variant],
        className
      )}
    >
      {children}
    </button>
  );
}