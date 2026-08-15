import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { Course } from "@/types/course";

interface RecentCourseProps {
  courses: Course[];
}

function getStatusLabel(status: Course["status"]) {
  return status === "published" ? "เผยแพร่" : "Draft";
}

export default function RecentCourse({
  courses,
}: RecentCourseProps) {
  return (
    <section className="rounded-3xl border border-green-100 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#14532D]">
            คอร์สล่าสุด
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            รายการคอร์สที่สร้างล่าสุด
          </p>
        </div>

        <Link
          href="/farmer/articles"
          className="flex items-center gap-2 text-sm font-medium text-[#14532D] hover:underline"
        >
          ดูทั้งหมด
          <ArrowRight size={18} />
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="rounded-2xl bg-gray-50 p-8 text-center text-gray-500">
          ยังไม่มีคอร์ส
        </div>
      ) : (
        <div className="space-y-4">
          {courses.slice(0, 5).map((course) => (
            <Link
              key={course.id}
              href={`/farmer/articles/${course.id}`}
              className="flex items-center justify-between rounded-2xl border border-green-100 p-4 transition hover:bg-green-50"
            >
              <div>
                <h3 className="font-semibold text-[#14532D]">
                  {course.title}
                </h3>

                <p className="mt-1 line-clamp-1 text-sm text-gray-500">
                  {course.description}
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  {new Date(
                    course.created_at
                  ).toLocaleDateString("th-TH")}
                </p>
              </div>

              <span className="shrink-0 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                {getStatusLabel(course.status)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
