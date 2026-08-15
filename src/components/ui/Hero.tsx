import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface HeroProps {
  title: string;
  description: string;
  children?: ReactNode;
  className?: string;
}

export default function Hero({
  title,
  description,
  children,
  className,
}: HeroProps) {
  return (
    <section
      className={cn(
        "rounded-3xl bg-gradient-to-r from-[#14532D] to-[#166534] text-white p-8 lg:p-12 shadow-lg",
        className
      )}
    >
      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold lg:text-4xl">
          {title}
        </h1>

        <p className="mt-4 text-green-100 text-lg leading-relaxed">
          {description}
        </p>

        {children && (
          <div className="mt-8 flex flex-wrap gap-4">
            {children}
          </div>
        )}
      </div>
    </section>
  );
}