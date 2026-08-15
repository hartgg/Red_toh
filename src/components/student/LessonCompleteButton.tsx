"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

interface LessonCompleteButtonProps {
  courseId: string;
  lessonId: string;
  completed: boolean;
}

export default function LessonCompleteButton({
  courseId,
  lessonId,
  completed,
}: LessonCompleteButtonProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const request = completed
      ? supabase
          .from("lesson_progress")
          .delete()
          .eq("user_id", user.id)
          .eq("lesson_id", lessonId)
      : supabase.from("lesson_progress").insert({
          course_id: courseId,
          lesson_id: lessonId,
          user_id: user.id,
        });

    const { error } = await request;

    if (error && error.code !== "23505") {
      alert(`บันทึกความคืบหน้าไม่สำเร็จ: ${error.message}`);
      setLoading(false);
      return;
    }

    router.refresh();
    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      className={
        completed
          ? "rounded-2xl border border-green-300 bg-white px-5 py-3 font-semibold text-[#14532D] transition hover:bg-green-50 disabled:opacity-60"
          : "rounded-2xl bg-[#14532D] px-5 py-3 font-semibold text-white transition hover:bg-[#166534] disabled:opacity-60"
      }
    >
      {loading
        ? "กำลังบันทึก..."
        : completed
          ? "เรียนจบแล้ว"
          : "ทำเครื่องหมายว่าเรียนจบ"}
    </button>
  );
}
