import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  color?: string;
}

export default function StatCard({
  title,
  value,
  icon,
  color = "bg-[#C63228]",
}: StatCardProps) {
  return (
    <div
      className="
        rounded-3xl
        border
        border-[#171B18]/10
        bg-[#FFFDF7]
        p-6
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-lg
      "
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[#282B28]/60">
            {title}
          </p>

          <h2 className="mt-2 text-3xl font-bold text-[#171B18]">
            {value}
          </h2>
        </div>

        <div
          className={`
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-2xl
            text-white
            ${color}
          `}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}