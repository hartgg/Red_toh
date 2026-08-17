import Image from "next/image";
import Link from "next/link";

import type { Course } from "@/types/course";

interface StudentCourseCardProps {
  course: Course;
}

export default function StudentCourseCard({
  course,
}: StudentCourseCardProps) {
  return (
    <Link
      href={`/courses/${course.id}`}
      className="group overflow-hidden rounded-2xl border border-[#2E7D32]/15 bg-[#FFFDF7] shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:rounded-3xl"
    >
      <div className="relative aspect-video overflow-hidden bg-[#171B18]/10 sm:h-44 sm:aspect-auto">
        {course.image_url ? (
          <Image
            src={course.image_url}
            alt={course.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-center text-[10px] text-gray-400 sm:text-base">
            ไม่มีรูปภาพ
          </div>
        )}
      </div>

      <div className="space-y-2 p-2 sm:space-y-3 sm:p-5">
        <h3 className="line-clamp-2 text-xs font-bold text-[#171B18] sm:text-lg">
          {course.title}
        </h3>

        <p className="hidden line-clamp-3 text-sm leading-6 text-[#282B28]/75 sm:block">
          {course.description}
        </p>

        <span className="inline-flex rounded-full bg-[#C63228]/10 px-2 py-1 text-[10px] font-semibold text-[#C63228] sm:px-3 sm:text-xs">
          เรียนรู้ได้ทันที
        </span>
      </div>
    </Link>
  );
}
