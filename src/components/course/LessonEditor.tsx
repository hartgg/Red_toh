"use client";

import { Plus, Trash2 } from "lucide-react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export interface LessonDraft {
  id: string;
  title: string;
  description: string;
  youtube_url: string;
}

interface LessonEditorProps {
  lessons: LessonDraft[];
  setLessons: (lessons: LessonDraft[]) => void;
}

const createLessonDraft = (): LessonDraft => ({
  id: crypto.randomUUID(),
  title: "",
  description: "",
  youtube_url: "",
});

export default function LessonEditor({
  lessons,
  setLessons,
}: LessonEditorProps) {
  function handleAddLesson() {
    setLessons([
      ...lessons,
      createLessonDraft(),
    ]);
  }

  function handleRemoveLesson(id: string) {
    setLessons(
      lessons.filter((lesson) => lesson.id !== id)
    );
  }

  function handleLessonChange(
    id: string,
    field: keyof Omit<LessonDraft, "id">,
    value: string
  ) {
    setLessons(
      lessons.map((lesson) =>
        lesson.id === id
          ? {
              ...lesson,
              [field]: value,
            }
          : lesson
      )
    );
  }

  return (
    <Card className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#171B18]">
            บทเรียนในคอร์ส
          </h2>

          <p className="mt-1 text-sm text-[#282B28]/60">
            เพิ่มบทเรียน เรียงตามลำดับที่ผู้เรียนจะเห็น
          </p>
        </div>

        <Button
          type="button"
          onClick={handleAddLesson}
          className="gap-2"
        >
          <Plus size={18} />
          เพิ่มบทเรียน
        </Button>
      </div>

      {lessons.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#2E7D32]/25 bg-[#2E7D32]/10 p-6 text-center">
          <p className="font-medium text-[#171B18]">
            ยังไม่มีบทเรียน
          </p>

          <p className="mt-2 text-sm text-[#282B28]/60">
            กดเพิ่มบทเรียนเพื่อเริ่มสร้างเนื้อหาคอร์ส
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {lessons.map((lesson, index) => (
            <div
              key={lesson.id}
              className="rounded-2xl border border-[#2E7D32]/15 bg-[#2E7D32]/10 p-5"
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-bold text-[#171B18]">
                    บทเรียนที่ {index + 1}
                  </h3>

                  <p className="mt-1 text-sm text-[#282B28]/60">
                    lesson_order จะถูกบันทึกเป็น {index + 1}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleRemoveLesson(lesson.id)
                  }
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-red-200 bg-[#FFFDF7] text-red-600 transition hover:bg-red-50"
                  aria-label={`ลบบทเรียนที่ ${index + 1}`}
                  title={`ลบบทเรียนที่ ${index + 1}`}
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block font-medium text-[#171B18]">
                    ชื่อบทเรียน
                  </label>

                  <input
                    type="text"
                    value={lesson.title}
                    onChange={(e) =>
                      handleLessonChange(
                        lesson.id,
                        "title",
                        e.target.value
                      )
                    }
                    placeholder="เช่น การเตรียมดิน"
                    className="w-full rounded-2xl border border-[#2E7D32]/25 bg-[#FFFDF7] px-4 py-3 outline-none transition focus:border-[#C63228] focus:ring-2 focus:ring-[#C63228]/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-medium text-[#171B18]">
                    รายละเอียดบทเรียน
                  </label>

                  <textarea
                    value={lesson.description}
                    onChange={(e) =>
                      handleLessonChange(
                        lesson.id,
                        "description",
                        e.target.value
                      )
                    }
                    rows={4}
                    placeholder="อธิบายสิ่งที่ผู้เรียนจะได้เรียนในบทนี้"
                    className="w-full resize-none rounded-2xl border border-[#2E7D32]/25 bg-[#FFFDF7] px-4 py-3 leading-7 outline-none transition focus:border-[#C63228] focus:ring-2 focus:ring-[#C63228]/10"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-medium text-[#171B18]">
                    YouTube URL
                  </label>

                  <input
                    type="url"
                    value={lesson.youtube_url}
                    onChange={(e) =>
                      handleLessonChange(
                        lesson.id,
                        "youtube_url",
                        e.target.value
                      )
                    }
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full rounded-2xl border border-[#2E7D32]/25 bg-[#FFFDF7] px-4 py-3 outline-none transition focus:border-[#C63228] focus:ring-2 focus:ring-[#C63228]/10"
                  />

                  <p className="mt-2 text-sm text-[#282B28]/60">
                    ไม่บังคับ สามารถเพิ่มวิดีโอภายหลังได้
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
