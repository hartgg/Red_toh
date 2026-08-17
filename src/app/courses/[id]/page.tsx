import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import EnrollCourseButton from "@/components/student/EnrollCourseButton";
import { createClient } from "@/lib/supabase/server";
import type { Course, Lesson } from "@/types/course";
import type { CourseEnrollment } from "@/types/studentLearning";

interface CourseDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CourseDetailPage({
  params,
}: CourseDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select(
      "id,user_id,title,description,image_url,status,created_at,updated_at"
    )
    .eq("id", id)
    .eq("status", "published")
    .single<Course>();

  if (!course) {
    notFound();
  }

  const { data: lessons } = await supabase
    .from("lessons")
    .select(
      "id,course_id,title,description,youtube_url,lesson_order,created_at,updated_at"
    )
    .eq("course_id", course.id)
    .order("lesson_order", {
      ascending: true,
    })
    .returns<Lesson[]>();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: enrollment } = user
    ? await supabase
        .from("course_enrollments")
        .select("id,course_id,user_id,created_at")
        .eq("course_id", course.id)
        .eq("user_id", user.id)
        .maybeSingle<CourseEnrollment>()
    : { data: null };

  const courseLessons = lessons ?? [];
  const firstLessonId = courseLessons[0]?.id ?? null;

  return (
    <main className="min-h-screen bg-[#F5F1E8]">
      <header className="border-b border-[#171B18]/10 bg-[#FFFDF7]">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="text-2xl font-bold text-[#171B18]"
          >
            RED TOH
          </Link>
          <Link
            href="/student/dashboard"
            className="rounded-xl bg-[#C63228] px-4 py-2 text-sm font-medium text-white"
          >
            คอร์สของฉัน
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
        <section className="overflow-hidden rounded-3xl border border-[#171B18]/10 bg-[#FFFDF7] shadow-sm">
          <div className="relative h-72 bg-[#FFF8EF] md:h-96">
            {course.image_url ? (
              <Image
                src={course.image_url}
                alt={course.title}
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-[#282B28]/45">
                ยังไม่มีรูปภาพคอร์ส
              </div>
            )}
          </div>

          <div className="space-y-5 p-6 md:p-8">
            <Link
              href="/courses"
              className="text-sm font-semibold text-[#171B18] hover:underline"
            >
              กลับไปดูคอร์สทั้งหมด
            </Link>

            <div>
              <p className="text-sm font-semibold text-[#C63228]">
                คอร์สอาชีพเกษตร
              </p>
              <h1 className="mt-2 text-3xl font-bold text-[#171B18] md:text-4xl">
                {course.title}
              </h1>
            </div>

            <p className="whitespace-pre-line text-lg leading-8 text-[#282B28]">
              {course.description}
            </p>

            <EnrollCourseButton
              courseId={course.id}
              isEnrolled={Boolean(enrollment)}
              firstLessonId={firstLessonId}
            />
          </div>
        </section>

        <aside className="rounded-3xl border border-[#171B18]/10 bg-[#FFFDF7] p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-[#171B18]">
            บทเรียนในคอร์ส
          </h2>
          <p className="mt-2 text-sm text-[#282B28]/75">
            ทั้งหมด {courseLessons.length} บทเรียน
          </p>

          {courseLessons.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-[#171B18]/15 p-5 text-center text-[#282B28]/60">
              คอร์สนี้ยังไม่มีบทเรียน
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {courseLessons.map((lesson, index) => (
                <Link
                  key={lesson.id}
                  href={
                    enrollment
                      ? `/courses/${course.id}/lessons/${lesson.id}`
                      : "/login"
                  }
                  className="block rounded-2xl border border-[#171B18]/10 p-4 transition hover:border-[#C63228] hover:bg-[#C63228]/10"
                >
                  <p className="text-xs font-semibold text-[#C63228]">
                    บทเรียนที่ {index + 1}
                  </p>
                  <h3 className="mt-1 font-bold text-[#171B18]">
                    {lesson.title}
                  </h3>
                  {lesson.description && (
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#282B28]/75">
                      {lesson.description}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
