"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";

import Container from "@/components/ui/Container";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import SectionTitle from "@/components/ui/SectionTitle";
import CourseMedia from "@/components/course/CourseMedia";
import CoursePreview from "@/components/course/CoursePreview";
import LessonEditor, {
  type LessonDraft,
} from "@/components/course/LessonEditor";
import { createClient } from "@/lib/supabase/client";

type CourseStatus = "published" | "draft";

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

function createLessonDraft(): LessonDraft {
  return {
    id: crypto.randomUUID(),
    title: "",
    description: "",
    youtube_url: "",
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

export default function CreateArticlePage() {
  const supabase = createClient();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [lessons, setLessons] = useState<LessonDraft[]>([
    createLessonDraft(),
  ]);
  const [imageFile, setImageFile] =
    useState<File | null>(null);
  const [status, setStatus] =
    useState<CourseStatus>("published");
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();
    const normalizedLessons = lessons.map((lesson) => ({
      id: lesson.id,
      title: lesson.title.trim(),
      description: lesson.description.trim(),
      youtube_url: lesson.youtube_url.trim(),
    }));

    if (!trimmedTitle) {
      alert("กรุณากรอกชื่อคอร์ส");
      setIsSubmitting(false);
      return;
    }

    if (!trimmedContent) {
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

      let imageUrl: string | null = null;

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

      const {
        data: course,
        error: courseError,
      } = await supabase
        .from("courses")
        .insert({
          user_id: user.id,
          title: trimmedTitle,
          description: trimmedContent,
          image_url: imageUrl,
          status,
        })
        .select("id")
        .single();

      if (courseError || !course) {
        alert(
          `บันทึกคอร์สไม่สำเร็จ: ${
            courseError?.message ?? "ไม่พบข้อมูลคอร์สที่สร้าง"
          }`
        );
        setIsSubmitting(false);
        return;
      }

      const lessonRows: LessonInsert[] =
        normalizedLessons.map((lesson, index) => ({
          course_id: course.id,
          title: lesson.title,
          description: lesson.description,
          youtube_url: lesson.youtube_url || null,
          lesson_order: index + 1,
        }));

      const { error: lessonsError } =
        await supabase
          .from("lessons")
          .insert(lessonRows);

      if (lessonsError) {
        const { error: cleanupError } =
          await supabase
            .from("courses")
            .delete()
            .eq("id", course.id);

        alert(
          cleanupError
            ? `บันทึกบทเรียนไม่สำเร็จ: ${lessonsError.message} และลบคอร์สที่สร้างค้างไว้ไม่สำเร็จ: ${cleanupError.message}`
            : `บันทึกบทเรียนไม่สำเร็จ: ${lessonsError.message} ระบบลบคอร์สที่สร้างค้างไว้แล้ว`
        );
        setIsSubmitting(false);
        return;
      }

      alert(
        status === "published"
          ? "เผยแพร่คอร์สสำเร็จ"
          : "บันทึกคอร์สเป็นฉบับร่างสำเร็จ"
      );

      router.push("/farmer/articles");
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
    <Container className="py-8">
      <SectionTitle
        title="สร้างคอร์สใหม่"
        subtitle="แบ่งความรู้เป็นบทเรียนสั้น ๆ ให้ผู้เรียนติดตามง่าย"
      />

      <div className="grid gap-8 xl:grid-cols-2">
        <Card>
          <form
            onSubmit={handleSubmit}
            className="space-y-8"
          >
            <div className="space-y-6">
              <div>
                <label className="mb-2 block font-medium text-[#171B18]">
                  ชื่อคอร์ส
                </label>

                <input
                  type="text"
                  placeholder="เช่น การปลูกข้าวอินทรีย์สำหรับมือใหม่"
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  disabled={isSubmitting}
                  required
                  className="
                    w-full
                    rounded-2xl
                    border
                    border-[#2E7D32]/25
                    px-4
                    py-3
                    outline-none
                    transition
                    focus:border-[#C63228]
                    focus:ring-2
                    focus:ring-[#C63228]/10
                    disabled:cursor-not-allowed
                    disabled:bg-[#EEE8DD]
                  "
                />
              </div>

              <div>
                <label className="mb-2 block font-medium text-[#171B18]">
                  รายละเอียดคอร์ส
                </label>

                <textarea
                  rows={8}
                  placeholder="อธิบายภาพรวมของคอร์ส สิ่งที่ผู้เรียนจะได้รับ และเหมาะกับใคร"
                  value={content}
                  onChange={(event) =>
                    setContent(event.target.value)
                  }
                  disabled={isSubmitting}
                  required
                  className="
                    w-full
                    resize-none
                    rounded-2xl
                    border
                    border-[#2E7D32]/25
                    px-4
                    py-3
                    leading-7
                    outline-none
                    transition
                    focus:border-[#C63228]
                    focus:ring-2
                    focus:ring-[#C63228]/10
                    disabled:cursor-not-allowed
                    disabled:bg-[#EEE8DD]
                  "
                />
              </div>

              <CourseMedia
                imageFile={imageFile}
                setImageFile={setImageFile}
                disabled={isSubmitting}
              />

              <LessonEditor
                lessons={lessons}
                setLessons={setLessons}
              />

              <div>
                <label className="mb-2 block font-medium text-[#171B18]">
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
                  className="
                    w-full
                    rounded-2xl
                    border
                    border-[#2E7D32]/25
                    bg-[#FFFDF7]
                    px-4
                    py-3
                    outline-none
                    transition
                    focus:border-[#C63228]
                    focus:ring-2
                    focus:ring-[#C63228]/10
                    disabled:cursor-not-allowed
                    disabled:bg-[#EEE8DD]
                    md:w-72
                  "
                >
                  <option value="published">
                    เผยแพร่
                  </option>

                  <option value="draft">
                    Draft
                  </option>
                </select>

                <p className="mt-2 text-sm text-[#282B28]/60">
                  เลือก Draft หากยังไม่ต้องการเผยแพร่คอร์ส
                </p>
              </div>
            </div>

            <div
              className="
                flex
                flex-col
                gap-3
                border-t
                border-[#2E7D32]/15
                pt-6
                sm:flex-row
                sm:justify-end
              "
            >
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() =>
                  router.push("/farmer/articles")
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
                  : status === "published"
                    ? "เผยแพร่คอร์ส"
                    : "บันทึกฉบับร่าง"}
              </Button>
            </div>
          </form>
        </Card>

        <div className="xl:sticky xl:top-24 xl:self-start">
          <CoursePreview
            title={title}
            content={content}
            imageFile={imageFile}
            lessons={lessons}
            status={status}
          />
        </div>
      </div>
    </Container>
  );
}
