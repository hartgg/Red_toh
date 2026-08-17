import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({
  children,
  className = "",
}: CardProps) {
  return (
    <div
      className={`
        bg-[#FFFDF7]
        rounded-3xl
        border
        border-[#2E7D32]/15
        shadow-sm
        p-6
        transition-all
        duration-300
        hover:shadow-lg
        ${className}
      `}
    >
      {children}
    </div>
  );
}
