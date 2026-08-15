import Link from "next/link";

import { requireStudent } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Course } from "@/types/course";
import type { CourseEnrollment } from "@/types/studentLearning";

export default async function StudentCoursesPage() {
  const { user } = await requireStudent();
  const supabase = await createClient();

  const { data: enrollments } = await supabase
    .from("course_enrollments")
    .select("id,course_id,user_id,created_at")
    .eq("user_id", user.id)
    .order("created_at", {
      ascending: false,
    })
    .returns<CourseEnrollment[]>();

  const courseIds = [
    ...new Set((enrollments ?? []).map((item) => item.course_id)),
  ];

  const { data: courses } =
    courseIds.length > 0
      ? await supabase
          .from("courses")
          .select(
            "id,user_id,title,description,image_url,status,created_at,updated_at"
          )
          .in("id", courseIds)
          .returns<Course[]>()
      : { data: [] };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#14532D]">
          คอร์สของฉัน
        </h1>
        <p className="mt-2 text-gray-600">
          รวมคอร์สที่คุณสมัครเรียนไว้ทั้งหมด
        </p>
      </div>

      {(courses ?? []).length === 0 ? (
        <div className="rounded-3xl border border-dashed border-green-200 bg-white p-10 text-center text-gray-600">
          ยังไม่มีคอร์สในรายการของคุณ
          <div className="mt-5">
            <Link
              href="/courses"
              className="inline-flex rounded-2xl bg-[#14532D] px-5 py-3 font-semibold text-white"
            >
              เลือกคอร์สเรียน
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(courses ?? []).map((course) => (
            <Link
              key={course.id}
              href={`/courses/${course.id}`}
              className="rounded-3xl border border-green-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <h2 className="text-xl font-bold text-[#14532D]">
                {course.title}
              </h2>
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600">
                {course.description}
              </p>
              <span className="mt-5 inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                เข้าเรียน
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
