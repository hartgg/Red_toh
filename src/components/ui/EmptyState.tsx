import { ReactNode } from "react";

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export default function SectionTitle({
  title,
  subtitle,
  action,
}: SectionTitleProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h2 className="text-2xl font-bold text-[#171B18]">
          {title}
        </h2>

        {subtitle && (
          <p className="mt-2 text-[#282B28]/75">
            {subtitle}
          </p>
        )}
      </div>

      {action}
    </div>
  );
}
