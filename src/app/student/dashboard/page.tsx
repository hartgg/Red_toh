import Link from "next/link";

import { requireStudent } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Course } from "@/types/course";
import type {
  CourseEnrollment,
  LessonProgress,
} from "@/types/studentLearning";

interface DashboardCourse extends Course {
  lessonCount: number;
  completedCount: number;
}

export default async function StudentDashboardPage() {
  const { user, profile } = await requireStudent();
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

  const { data: progressRows } =
    courseIds.length > 0
      ? await supabase
          .from("lesson_progress")
          .select("id,course_id,lesson_id,user_id,completed_at")
          .eq("user_id", user.id)
          .in("course_id", courseIds)
          .returns<LessonProgress[]>()
      : { data: [] };

  const dashboardCourses: DashboardCourse[] = await Promise.all(
    (courses ?? []).map(async (course) => {
      const { count } = await supabase
        .from("lessons")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("course_id", course.id);

      const completedCount = (progressRows ?? []).filter(
        (progress) => progress.course_id === course.id
      ).length;

      return {
        ...course,
        lessonCount: count ?? 0,
        completedCount,
      };
    })
  );

  const completedCourses = dashboardCourses.filter(
    (course) =>
      course.lessonCount > 0 &&
      course.completedCount >= course.lessonCount
  ).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-3xl bg-[#C63228] p-6 text-white shadow-sm md:p-8">
        <p className="text-sm font-semibold text-white/80">
          สวัสดีคุณ {profile.full_name ?? "ผู้เรียน"}
        </p>
        <h1 className="mt-3 text-3xl font-bold md:text-4xl">
          วันนี้มาเรียนรู้อาชีพเกษตรต่อกันครับ
        </h1>
        <p className="mt-3 max-w-2xl text-white/85">
          หน้านี้รวมคอร์สที่สมัครไว้ ความคืบหน้า และทางลัดกลับไปเรียนบทเรียนล่าสุด
        </p>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-[#2E7D32]/15 bg-[#FFFDF7] p-5 shadow-sm">
          <p className="text-sm text-[#282B28]/60">คอร์สที่สมัคร</p>
          <p className="mt-2 text-3xl font-bold text-[#171B18]">
            {dashboardCourses.length}
          </p>
        </div>
        <div className="rounded-3xl border border-[#2E7D32]/15 bg-[#FFFDF7] p-5 shadow-sm">
          <p className="text-sm text-[#282B28]/60">บทเรียนที่เรียนจบ</p>
          <p className="mt-2 text-3xl font-bold text-[#171B18]">
            {(progressRows ?? []).length}
          </p>
        </div>
        <div className="rounded-3xl border border-[#2E7D32]/15 bg-[#FFFDF7] p-5 shadow-sm">
          <p className="text-sm text-[#282B28]/60">คอร์สที่เรียนครบ</p>
          <p className="mt-2 text-3xl font-bold text-[#171B18]">
            {completedCourses}
          </p>
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-[#171B18]">
            คอร์สของฉัน
          </h2>
          <Link
            href="/student/courses"
            className="text-sm font-semibold text-[#171B18] hover:underline"
          >
            ดูทั้งหมด
          </Link>
        </div>

        {dashboardCourses.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#2E7D32]/25 bg-[#FFFDF7] p-10 text-center text-[#282B28]/75">
            ยังไม่ได้สมัครคอร์ส ลองเลือกอาชีพที่สนใจเพื่อเริ่มเรียนได้เลย
            <div className="mt-5">
              <Link
                href="/courses"
                className="inline-flex rounded-2xl bg-[#C63228] px-5 py-3 font-semibold text-white"
              >
                ดูคอร์สทั้งหมด
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {dashboardCourses.slice(0, 4).map((course) => {
              const percent =
                course.lessonCount === 0
                  ? 0
                  : Math.round(
                      (course.completedCount / course.lessonCount) *
                        100
                    );

              return (
                <Link
                  key={course.id}
                  href={`/courses/${course.id}`}
                  className="rounded-3xl border border-[#2E7D32]/15 bg-[#FFFDF7] p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <h3 className="text-xl font-bold text-[#171B18]">
                    {course.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#282B28]/75">
                    {course.description}
                  </p>
                  <div className="mt-4">
                    <div className="h-3 overflow-hidden rounded-full bg-[#2E7D32]/15">
                      <div
                        className="h-full rounded-full bg-[#C63228]"
                        style={{
                          width: `${percent}%`,
                        }}
                      />
                    </div>
                    <p className="mt-2 text-sm font-semibold text-[#282B28]/75">
                      เรียนแล้ว {course.completedCount}/
                      {course.lessonCount} บทเรียน
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
