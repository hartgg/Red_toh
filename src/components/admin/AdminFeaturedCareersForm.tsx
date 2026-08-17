"use client";

import Image from "next/image";
import { useState } from "react";
import type { FormEvent } from "react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";
import type { Course } from "@/types/course";
import type { FeaturedCareer } from "@/types/featuredCareer";

interface AdminFeaturedCareersFormProps {
  courses: Course[];
  featuredCareers: FeaturedCareer[];
}

interface SlideState {
  slot: number;
  courseId: string;
  imageUrl: string | null;
  imageFile: File | null;
}

interface FeaturedCareerUpsert {
  slot: number;
  course_id: string;
  image_url: string | null;
}

const allowedImageTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const maxImageSize = 5 * 1024 * 1024;

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

function createInitialSlides(
  featuredCareers: FeaturedCareer[],
  courses: Course[]
) {
  return [1, 2, 3].map((slot) => {
    const featured = featuredCareers.find(
      (item) => item.slot === slot
    );

    return {
      slot,
      courseId:
        featured?.course_id ?? courses[slot - 1]?.id ?? "",
      imageUrl: featured?.image_url ?? null,
      imageFile: null,
    };
  });
}

export default function AdminFeaturedCareersForm({
  courses,
  featuredCareers,
}: AdminFeaturedCareersFormProps) {
  const supabase = createClient();
  const [slides, setSlides] = useState<SlideState[]>(
    createInitialSlides(featuredCareers, courses)
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  function updateSlide(
    slot: number,
    values: Partial<SlideState>
  ) {
    setSlides((currentSlides) =>
      currentSlides.map((slide) =>
        slide.slot === slot
          ? {
              ...slide,
              ...values,
            }
          : slide
      )
    );
    setMessage("");
    setErrorMessage("");
  }

  async function uploadSlideImage(slide: SlideState) {
    if (!slide.imageFile) {
      return slide.imageUrl;
    }

    if (
      !allowedImageTypes.includes(slide.imageFile.type)
    ) {
      throw new Error(
        `รูปสไลด์ที่ ${slide.slot} ต้องเป็นไฟล์ JPG, PNG หรือ WEBP`
      );
    }

    if (slide.imageFile.size > maxImageSize) {
      throw new Error(
        `รูปสไลด์ที่ ${slide.slot} ต้องมีขนาดไม่เกิน 5MB`
      );
    }

    const fileExt = getImageExtension(slide.imageFile);
    const filePath = `featured-careers/slide-${slide.slot}-${Date.now()}.${fileExt}`;

    const { error: uploadError } =
      await supabase.storage
        .from("article-images")
        .upload(filePath, slide.imageFile, {
          upsert: true,
        });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data } = supabase.storage
      .from("article-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setErrorMessage("");

    try {
      const rows: FeaturedCareerUpsert[] = [];

      for (const slide of slides) {
        if (!slide.courseId) {
          throw new Error(
            `กรุณาเลือกคอร์สสำหรับสไลด์ที่ ${slide.slot}`
          );
        }

        const imageUrl = await uploadSlideImage(slide);

        rows.push({
          slot: slide.slot,
          course_id: slide.courseId,
          image_url: imageUrl,
        });
      }

      const { error } = await supabase
        .from("featured_careers")
        .upsert(rows, {
          onConflict: "slot",
        });

      if (error) {
        throw new Error(error.message);
      }

      setSlides((currentSlides) =>
        currentSlides.map((slide) => {
          const savedRow = rows.find(
            (row) => row.slot === slide.slot
          );

          return {
            ...slide,
            imageUrl: savedRow?.image_url ?? null,
            imageFile: null,
          };
        })
      );

      setMessage("บันทึกอาชีพยอดฮิตสำเร็จ");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "บันทึกไม่สำเร็จ"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <div>
          <h2 className="text-2xl font-bold text-[#171B18]">
            อาชีพยอดฮิตหน้าแรก
          </h2>

          <p className="mt-2 text-[#282B28]/75">
            เลือกคอร์สและรูปภาพสำหรับสไลด์ 3 รูปด้านบนของหน้าผู้เรียน
          </p>

          <p className="mt-2 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
            ขนาดรูปแนะนำ: 1920 × 480 px
            หรือสัดส่วน 4:1 เช่น 1600 × 400 px / 1200 × 300 px
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {slides.map((slide) => (
            <div
              key={slide.slot}
              className="rounded-3xl border border-[#171B18]/10 bg-[#FFF8EF] p-5"
            >
              <h3 className="font-bold text-[#171B18]">
                สไลด์ที่ {slide.slot}
              </h3>

              <label className="mt-4 block text-sm font-medium text-[#171B18]">
                เลือกคอร์ส
              </label>

              <select
                value={slide.courseId}
                onChange={(event) =>
                  updateSlide(slide.slot, {
                    courseId: event.target.value,
                  })
                }
                disabled={saving}
                className="mt-2 w-full rounded-2xl border border-[#171B18]/15 bg-[#FFFDF7] px-4 py-3 outline-none focus:border-[#C63228] focus:ring-2 focus:ring-[#C63228]/10"
              >
                <option value="">
                  เลือกคอร์ส
                </option>
                {courses.map((course) => (
                  <option
                    key={course.id}
                    value={course.id}
                  >
                    {course.title}
                  </option>
                ))}
              </select>

              <label className="mt-4 block text-sm font-medium text-[#171B18]">
                รูปภาพสไลด์
              </label>

              <p className="mt-1 text-xs text-[#282B28]/60">
                ใช้รูปแนวนอนแบบป้ายยาว ขนาดแนะนำ 1920 × 480 px
              </p>

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={saving}
                onChange={(event) =>
                  updateSlide(slide.slot, {
                    imageFile:
                      event.target.files?.[0] ?? null,
                  })
                }
                className="mt-2 w-full rounded-2xl border border-[#171B18]/15 bg-[#FFFDF7] px-4 py-3 text-sm"
              />

              {slide.imageUrl && (
                <div className="relative mt-4 h-36 overflow-hidden rounded-2xl bg-[#FFFDF7]">
                  <Image
                    src={slide.imageUrl}
                    alt={`รูปสไลด์ที่ ${slide.slot}`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {errorMessage && (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </p>
        )}

        {message && (
          <p className="rounded-2xl border border-[#171B18]/15 bg-[#FFF8EF] px-4 py-3 text-sm text-[#C63228]">
            {message}
          </p>
        )}

        <div className="flex justify-end border-t border-[#171B18]/10 pt-6">
          <Button
            type="submit"
            disabled={saving || courses.length === 0}
          >
            {saving
              ? "กำลังบันทึก..."
              : "บันทึกอาชีพยอดฮิต"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
