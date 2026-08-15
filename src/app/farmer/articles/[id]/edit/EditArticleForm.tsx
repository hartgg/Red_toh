"use client";

import Image from "next/image";
import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import CourseMedia from "@/components/course/CourseMedia";
import LessonEditor, {
  type LessonDraft,
} from "@/components/course/LessonEditor";
import { createClient } from "@/lib/supabase/client";
import type { Course, Lesson } from "@/types/course";

type CourseStatus = Course["status"];

interface EditCourseFormProps {
  course: Course;
  lessons: Lesson[];
}

interface LessonInsert {
  course_id: string;
  title: string;
  description: string;
  youtube_url: string | null;
  lesson_order: number;
}

const allowedImageTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const allowedYoutubeHosts = [
  "youtube.com",
  "www.youtube.com",
  "youtu.be",
  "www.youtu.be",
];

const maxImageSize = 5 * 1024 * 1024;

function toLessonDraft(lesson: Lesson): LessonDraft {
  return {
    id: lesson.id,
    title: lesson.title,
    description: lesson.description,
    youtube_url: lesson.youtube_url ?? "",
  };
}

function isValidYoutubeUrl(value: string) {
  try {
    const url = new URL(value);
    return allowedYoutubeHosts.includes(
      url.hostname.toLowerCase()
    );
  } catch {
    return false;
  }
}

function getImageExtension(file: File) {
  const nameExtension = file.name
    .split(".")
    .pop()
    ?.toLowerCase();

  if (nameExtension) {
    return nameExtension;
  }

  if (file.type === "image/png") {
    return "png";
  }

  if (file.type === "image/webp") {
    return "webp";
  }

  return "jpg";
}

export default function EditCourseForm({
  course,
  lessons,
}: EditCourseFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const existingLessonIds = lessons.map(
    (lesson) => lesson.id
  );

  const [title, setTitle] = useState(course.title);
  const [description, setDescription] = useState(
    course.description
  );
  const [status, setStatus] =
    useState<CourseStatus>(course.status);
  const [imageFile, setImageFile] =
    useState<File | null>(null);
  const [lessonDrafts, setLessonDrafts] = useState<
    LessonDraft[]
  >(lessons.map(toLessonDraft));
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const normalizedLessons = lessonDrafts.map(
      (lesson) => ({
        id: lesson.id,
        title: lesson.title.trim(),
        description: lesson.description.trim(),
        youtube_url: lesson.youtube_url.trim(),
      })
    );

    if (!trimmedTitle) {
      alert("กรุณากรอกชื่อคอร์ส");
      setIsSubmitting(false);
      return;
    }

    if (!trimmedDescription) {
      alert("กรุณากรอกรายละเอียดคอร์ส");
      setIsSubmitting(false);
      return;
    }

    if (normalizedLessons.length === 0) {
      alert("กรุณาเพิ่มบทเรียนอย่างน้อย 1 บทเรียน");
      setIsSubmitting(false);
      return;
    }

    const emptyTitleLessonIndex =
      normalizedLessons.findIndex(
        (lesson) => !lesson.title
      );

    if (emptyTitleLessonIndex >= 0) {
      alert(
        `กรุณากรอกชื่อบทเรียนที่ ${emptyTitleLessonIndex + 1}`
      );
      setIsSubmitting(false);
      return;
    }

    const invalidYoutubeLessonIndex =
      normalizedLessons.findIndex(
        (lesson) =>
          lesson.youtube_url &&
          !isValidYoutubeUrl(lesson.youtube_url)
      );

    if (invalidYoutubeLessonIndex >= 0) {
      alert(
        `ลิงก์ YouTube ของบทเรียนที่ ${invalidYoutubeLessonIndex + 1} ไม่ถูกต้อง`
      );
      setIsSubmitting(false);
      return;
    }

    if (imageFile) {
      if (!allowedImageTypes.includes(imageFile.type)) {
        alert("รองรับเฉพาะไฟล์ JPG, PNG และ WEBP");
        setIsSubmitting(false);
        return;
      }

      if (imageFile.size > maxImageSize) {
        alert("ขนาดรูปต้องไม่เกิน 5MB");
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("กรุณา Login");
        setIsSubmitting(false);
        return;
      }

      if (user.id !== course.user_id) {
        alert("คุณไม่มีสิทธิ์แก้ไขคอร์สนี้");
        setIsSubmitting(false);
        return;
      }

      let imageUrl = course.image_url;

      if (imageFile) {
        const fileExt = getImageExtension(imageFile);
        const fileName = `${Date.now()}-${crypto.randomUUID()}.${fileExt}`;
        const filePath = `articles/${user.id}/${fileName}`;

        const { error: uploadError } =
          await supabase.storage
            .from("article-images")
            .upload(filePath, imageFile);

        if (uploadError) {
          alert(
            `อัปโหลดรูปไม่สำเร็จ: ${uploadError.message}`
          );
          setIsSubmitting(false);
          return;
        }

        const { data } = supabase.storage
          .from("article-images")
          .getPublicUrl(filePath);

        imageUrl = data.publicUrl;
      }

      const { error: courseError } =
        await supabase
          .from("courses")
          .update({
            title: trimmedTitle,
            description: trimmedDescription,
            image_url: imageUrl,
            status,
          })
          .eq("id", course.id);

      if (courseError) {
        alert(
          `บันทึกคอร์สไม่สำเร็จ: ${courseError.message}`
        );
        setIsSubmitting(false);
        return;
      }

      const existingIdSet = new Set(existingLessonIds);
      const nextExistingIdSet = new Set(
        normalizedLessons
          .filter((lesson) =>
            existingIdSet.has(lesson.id)
          )
          .map((lesson) => lesson.id)
      );

      const lessonIdsToDelete = existingLessonIds.filter(
        (id) => !nextExistingIdSet.has(id)
      );

      for (const lesson of normalizedLessons) {
        if (!existingIdSet.has(lesson.id)) {
          continue;
        }

        const { error: updateLessonError } =
          await supabase
            .from("lessons")
            .update({
              title: lesson.title,
              description: lesson.description,
              youtube_url:
                lesson.youtube_url || null,
              lesson_order:
                normalizedLessons.indexOf(lesson) + 1,
            })
            .eq("id", lesson.id)
            .eq("course_id", course.id);

        if (updateLessonError) {
          alert(
            `บันทึกบทเรียนไม่สำเร็จ: ${updateLessonError.message}`
          );
          setIsSubmitting(false);
          return;
        }
      }

      const newLessonRows: LessonInsert[] =
        normalizedLessons
          .filter(
            (lesson) => !existingIdSet.has(lesson.id)
          )
          .map((lesson) => ({
            course_id: course.id,
            title: lesson.title,
            description: lesson.description,
            youtube_url: lesson.youtube_url || null,
            lesson_order:
              normalizedLessons.findIndex(
                (item) => item.id === lesson.id
              ) + 1,
          }));

      if (newLessonRows.length > 0) {
        const { error: insertLessonsError } =
          await supabase
            .from("lessons")
            .insert(newLessonRows);

        if (insertLessonsError) {
          alert(
            `เพิ่มบทเรียนใหม่ไม่สำเร็จ: ${insertLessonsError.message}`
          );
          setIsSubmitting(false);
          return;
        }
      }

      if (lessonIdsToDelete.length > 0) {
        const { error: deleteLessonsError } =
          await supabase
            .from("lessons")
            .delete()
            .eq("course_id", course.id)
            .in("id", lessonIdsToDelete);

        if (deleteLessonsError) {
          alert(
            `ลบบทเรียนที่เอาออกไม่สำเร็จ: ${deleteLessonsError.message}`
          );
          setIsSubmitting(false);
          return;
        }
      }

      alert("แก้ไขคอร์สสำเร็จ");
      router.push(`/farmer/articles/${course.id}`);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert(
        "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8"
    >
      <Card className="space-y-6">
        <div>
          <label className="mb-2 block font-medium text-[#14532D]">
            ชื่อคอร์ส
          </label>

          <input
            type="text"
            value={title}
            onChange={(event) =>
              setTitle(event.target.value)
            }
            disabled={isSubmitting}
            className="w-full rounded-2xl border border-green-200 px-4 py-3 outline-none transition focus:border-[#14532D] focus:ring-2 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="mb-2 block font-medium text-[#14532D]">
            รายละเอียดคอร์ส
          </label>

          <textarea
            rows={8}
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            disabled={isSubmitting}
            className="w-full resize-none rounded-2xl border border-green-200 px-4 py-3 leading-7 outline-none transition focus:border-[#14532D] focus:ring-2 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-gray-100"
          />
        </div>

        {course.image_url && !imageFile && (
          <div>
            <p className="mb-2 block font-medium text-[#14532D]">
              รูปปกปัจจุบัน
            </p>

            <div className="relative h-64 overflow-hidden rounded-2xl bg-green-50">
              <Image
                src={course.image_url}
                alt={course.title}
                fill
                sizes="(max-width: 1280px) 100vw, 720px"
                className="object-cover"
              />
            </div>
          </div>
        )}

        <CourseMedia
          imageFile={imageFile}
          setImageFile={setImageFile}
          disabled={isSubmitting}
        />

        <div>
          <label className="mb-2 block font-medium text-[#14532D]">
            สถานะคอร์ส
          </label>

          <select
            value={status}
            onChange={(event) =>
              setStatus(
                event.target.value as CourseStatus
              )
            }
            disabled={isSubmitting}
            className="w-full rounded-2xl border border-green-200 bg-white px-4 py-3 outline-none transition focus:border-[#14532D] focus:ring-2 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-gray-100 md:w-72"
          >
            <option value="published">
              เผยแพร่
            </option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </Card>

      <LessonEditor
        lessons={lessonDrafts}
        setLessons={setLessonDrafts}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting}
          onClick={() =>
            router.push(`/farmer/articles/${course.id}`)
          }
        >
          ยกเลิก
        </Button>

        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "กำลังบันทึก..."
            : "บันทึกการแก้ไข"}
        </Button>
      </div>
    </form>
  );
}
