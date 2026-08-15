"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

interface EnrollCourseButtonProps {
  courseId: string;
  isEnrolled: boolean;
  firstLessonId: string | null;
}

export default function EnrollCourseButton({
  courseId,
  isEnrolled,
  firstLessonId,
}: EnrollCourseButtonProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (isEnrolled) {
      if (firstLessonId) {
        router.push(
          `/courses/${courseId}/lessons/${firstLessonId}`
        );
        return;
      }

      router.push("/student/courses");
      return;
    }

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { error } = await supabase
      .from("course_enrollments")
      .insert({
        course_id: courseId,
        user_id: user.id,
      });

    if (error && error.code !== "23505") {
      alert(`สมัครเรียนไม่สำเร็จ: ${error.message}`);
      setLoading(false);
      return;
    }

    if (firstLessonId) {
      router.push(
        `/courses/${courseId}/lessons/${firstLessonId}`
      );
      router.refresh();
      return;
    }

    router.refresh();
    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="w-full rounded-2xl bg-[#14532D] px-6 py-4 text-lg font-bold text-white transition hover:bg-[#166534] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
    >
      {loading
        ? "กำลังสมัครเรียน..."
        : isEnrolled
          ? "เข้าเรียนต่อ"
          : "สมัครเรียนคอร์สนี้"}
    </button>
  );
}
