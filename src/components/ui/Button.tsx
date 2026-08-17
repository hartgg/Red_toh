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
      "bg-[#C63228] text-white hover:bg-[#A92B23]",

    secondary:
      "bg-[#2E7D32] text-white hover:bg-[#256B2B]",

    outline:
      "border border-[#C63228] text-[#C63228] hover:bg-[#C63228]/10",
  };

  return (
    <button
      {...props}
      className={clsx(
        "inline-flex items-center justify-center rounded-xl px-5 py-3 font-medium shadow-sm transition disabled:opacity-50",
        variants[variant],
        className
      )}
    >
      {children}
    </button>
  );
}
