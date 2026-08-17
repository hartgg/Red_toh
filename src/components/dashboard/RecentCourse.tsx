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
    <section className="rounded-3xl border border-[#171B18]/10 bg-[#FFFDF7] p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#171B18]">
            คอร์สล่าสุด
          </h2>

          <p className="mt-1 text-sm text-[#282B28]/60">
            รายการคอร์สที่สร้างล่าสุด
          </p>
        </div>

        <Link
          href="/farmer/articles"
          className="flex items-center gap-2 text-sm font-medium text-[#171B18] hover:underline"
        >
          ดูทั้งหมด
          <ArrowRight size={18} />
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="rounded-2xl bg-[#F5F1E8] p-8 text-center text-[#282B28]/60">
          ยังไม่มีคอร์ส
        </div>
      ) : (
        <div className="space-y-4">
          {courses.slice(0, 5).map((course) => (
            <Link
              key={course.id}
              href={`/farmer/articles/${course.id}`}
              className="flex items-center justify-between rounded-2xl border border-[#171B18]/10 p-4 transition hover:bg-[#C63228]/10"
            >
              <div>
                <h3 className="font-semibold text-[#171B18]">
                  {course.title}
                </h3>

                <p className="mt-1 line-clamp-1 text-sm text-[#282B28]/60">
                  {course.description}
                </p>

                <p className="mt-1 text-xs text-[#282B28]/45">
                  {new Date(
                    course.created_at
                  ).toLocaleDateString("th-TH")}
                </p>
              </div>

              <span className="shrink-0 rounded-full bg-[#C63228]/15 px-3 py-1 text-xs font-medium text-[#C63228]">
                {getStatusLabel(course.status)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
