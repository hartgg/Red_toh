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
      className="group overflow-hidden rounded-3xl border border-[#2E7D32]/15 bg-[#FFFDF7] shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative h-44 overflow-hidden bg-[#171B18]/10">
        {course.image_url ? (
          <Image
            src={course.image_url}
            alt={course.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            ไม่มีรูปภาพ
          </div>
        )}
      </div>

      <div className="space-y-3 p-5">
        <h3 className="line-clamp-2 text-lg font-bold text-[#171B18]">
          {course.title}
        </h3>

        <p className="line-clamp-3 text-sm leading-6 text-[#282B28]/75">
          {course.description}
        </p>

        <span className="inline-flex rounded-full bg-[#C63228]/10 px-3 py-1 text-xs font-semibold text-[#C63228]">
          เรียนรู้ได้ทันที
        </span>
      </div>
    </Link>
  );
}
