"use client";

import Image from "next/image";
import { useEffect, useMemo } from "react";

import Card from "@/components/ui/Card";
import type { LessonDraft } from "@/components/course/LessonEditor";

interface CoursePreviewProps {
  title: string;
  content: string;
  imageFile: File | null;
  lessons: LessonDraft[];
  status: string;
}

export default function CoursePreview({
  title,
  content,
  imageFile,
  lessons,
  status,
}: CoursePreviewProps) {
  const imagePreview = useMemo(() => {
    if (!imageFile) {
      return null;
    }

    return URL.createObjectURL(imageFile);
  }, [imageFile]);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-green-100 bg-green-50 px-6 py-4">
        <p className="text-sm font-medium text-[#14532D]">
          ตัวอย่างคอร์ส
        </p>

        <p className="mt-1 text-sm text-gray-500">
          ตัวอย่างที่ผู้เรียนจะเห็น
        </p>
      </div>

      <div>
        <div className="relative h-64 w-full overflow-hidden bg-gray-100">
          {imagePreview ? (
            <Image
              src={imagePreview}
              alt={title || "ตัวอย่างรูปปกคอร์ส"}
              fill
              sizes="(max-width: 1280px) 100vw, 50vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">
              ยังไม่มีรูปปกคอร์ส
            </div>
          )}

          <div className="absolute right-4 top-4">
            <span
              className={`
                rounded-full
                px-4
                py-2
                text-xs
                font-semibold
                ${
                  status === "published"
                    ? "bg-green-600 text-white"
                    : "bg-gray-600 text-white"
                }
              `}
            >
              {status === "published" ? "เผยแพร่" : "Draft"}
            </span>
          </div>
        </div>

        <div className="space-y-6 p-6">
          <div>
            <h2 className="text-2xl font-bold text-[#14532D]">
              {title || "ชื่อคอร์สของคุณ"}
            </h2>

            <p className="mt-3 whitespace-pre-line leading-7 text-gray-600">
              {content || "รายละเอียดคอร์สจะแสดงตรงนี้"}
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-lg font-bold text-[#14532D]">
              บทเรียนในคอร์ส
            </h3>

            {lessons.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-green-200 bg-green-50 p-4 text-sm text-gray-500">
                ยังไม่มีบทเรียน
              </p>
            ) : (
              <div className="space-y-3">
                {lessons.map((lesson, index) => (
                  <div
                    key={lesson.id}
                    className="rounded-2xl border border-green-100 bg-green-50/60 p-4"
                  >
                    <p className="text-sm font-semibold text-[#14532D]">
                      บทเรียนที่ {index + 1}
                    </p>

                    <p className="mt-1 font-medium text-gray-800">
                      {lesson.title.trim() || "ยังไม่ได้ตั้งชื่อบทเรียน"}
                    </p>

                    {lesson.description.trim() && (
                      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-600">
                        {lesson.description}
                      </p>
                    )}

                    {lesson.youtube_url.trim() && (
                      <p className="mt-2 text-sm text-green-700">
                        มีวิดีโอ YouTube ในบทนี้
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
