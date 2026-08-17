import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import LessonCompleteButton from "@/components/student/LessonCompleteButton";
import { requireStudent } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getYoutubeEmbedUrl } from "@/lib/youtube";
import type { Course, Lesson } from "@/types/course";
import type {
  CourseEnrollment,
  LessonProgress,
} from "@/types/studentLearning";

interface LessonPageProps {
  params: Promise<{
    id: string;
    lessonId: string;
  }>;
}

export default async function LessonPage({
  params,
}: LessonPageProps) {
  const { id, lessonId } = await params;
  const { user } = await requireStudent();
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

  const { data: enrollment } = await supabase
    .from("course_enrollments")
    .select("id,course_id,user_id,created_at")
    .eq("course_id", course.id)
    .eq("user_id", user.id)
    .maybeSingle<CourseEnrollment>();

  if (!enrollment) {
    redirect(`/courses/${course.id}`);
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

  const courseLessons = lessons ?? [];
  const lesson = courseLessons.find((item) => item.id === lessonId);

  if (!lesson) {
    notFound();
  }

  const lessonIndex = courseLessons.findIndex(
    (item) => item.id === lesson.id
  );
  const previousLesson = courseLessons[lessonIndex - 1];
  const nextLesson = courseLessons[lessonIndex + 1];
  const embedUrl = getYoutubeEmbedUrl(lesson.youtube_url);

  const { data: progressRows } = await supabase
    .from("lesson_progress")
    .select("id,course_id,lesson_id,user_id,completed_at")
    .eq("course_id", course.id)
    .eq("user_id", user.id)
    .returns<LessonProgress[]>();

  const completedLessonIds = new Set(
    (progressRows ?? []).map((progress) => progress.lesson_id)
  );
  const completed = completedLessonIds.has(lesson.id);

  return (
    <main className="min-h-screen bg-[#F5F1E8]">
      <header className="border-b border-[#171B18]/10 bg-[#FFFDF7]">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href={`/courses/${course.id}`}
            className="text-sm font-semibold text-[#171B18] hover:underline"
          >
            กลับหน้าคอร์ส
          </Link>
          <Link
            href="/student/dashboard"
            className="rounded-xl bg-[#C63228] px-4 py-2 text-sm font-medium text-white"
          >
            หน้าผู้เรียน
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
        <section className="rounded-3xl border border-[#171B18]/10 bg-[#FFFDF7] p-6 shadow-sm md:p-8">
          <p className="text-sm font-semibold text-[#C63228]">
            {course.title}
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[#171B18]">
            บทเรียนที่ {lessonIndex + 1}: {lesson.title}
          </h1>

          <div className="mt-6 overflow-hidden rounded-3xl bg-black">
            {embedUrl ? (
              <iframe
                src={embedUrl}
                title={lesson.title}
                className="aspect-video w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <div className="flex aspect-video items-center justify-center bg-[#FFF8EF] p-8 text-center text-[#282B28]/75">
                บทเรียนนี้ยังไม่มีวิดีโอ YouTube
              </div>
            )}
          </div>

          {lesson.description && (
            <p className="mt-6 whitespace-pre-line text-lg leading-8 text-[#282B28]">
              {lesson.description}
            </p>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <LessonCompleteButton
              courseId={course.id}
              lessonId={lesson.id}
              completed={completed}
            />

            <div className="flex gap-3">
              {previousLesson && (
                <Link
                  href={`/courses/${course.id}/lessons/${previousLesson.id}`}
                  className="rounded-2xl border border-[#171B18]/15 px-4 py-3 font-semibold text-[#171B18] hover:bg-[#C63228]/10"
                >
                  บทก่อนหน้า
                </Link>
              )}
              {nextLesson && (
                <Link
                  href={`/courses/${course.id}/lessons/${nextLesson.id}`}
                  className="rounded-2xl bg-[#C63228] px-4 py-3 font-semibold text-white hover:bg-[#A92B23]"
                >
                  บทถัดไป
                </Link>
              )}
            </div>
          </div>
        </section>

        <aside className="rounded-3xl border border-[#171B18]/10 bg-[#FFFDF7] p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-[#171B18]">
            รายการบทเรียน
          </h2>
          <p className="mt-2 text-sm text-[#282B28]/75">
            เรียนจบแล้ว {completedLessonIds.size}/
            {courseLessons.length} บทเรียน
          </p>

          <div className="mt-5 space-y-3">
            {courseLessons.map((item, index) => {
              const isActive = item.id === lesson.id;
              const isCompleted = completedLessonIds.has(item.id);

              return (
                <Link
                  key={item.id}
                  href={`/courses/${course.id}/lessons/${item.id}`}
                  className={
                    isActive
                      ? "block rounded-2xl border border-[#C63228] bg-[#FFF8EF] p-4"
                      : "block rounded-2xl border border-[#171B18]/10 p-4 hover:bg-[#C63228]/10"
                  }
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-[#C63228]">
                        บทเรียนที่ {index + 1}
                      </p>
                      <h3 className="mt-1 font-bold text-[#171B18]">
                        {item.title}
                      </h3>
                    </div>
                    {isCompleted && (
                      <span className="shrink-0 rounded-full bg-[#C63228]/15 px-2 py-1 text-xs font-semibold text-[#C63228]">
                        จบแล้ว
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </aside>
      </div>
    </main>
  );
}
