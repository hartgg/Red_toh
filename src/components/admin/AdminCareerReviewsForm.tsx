"use client";

import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import Card from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";
import { getYoutubeEmbedUrl } from "@/lib/youtube";
import type {
  CareerReview,
  CareerReviewStatus,
  CareerReviewType,
} from "@/types/careerReview";
import type { Course } from "@/types/course";

interface AdminCareerReviewsFormProps {
  courses: Course[];
  careerReviews: CareerReview[];
}

function getCareerTypeLabel(careerType: CareerReviewType) {
  return careerType === "primary"
    ? "อาชีพหลัก"
    : "อาชีพเสริม";
}

function getStatusLabel(status: CareerReviewStatus) {
  return status === "published" ? "เผยแพร่" : "แบบร่าง";
}

export default function AdminCareerReviewsForm({
  courses,
  careerReviews,
}: AdminCareerReviewsFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [reviews, setReviews] =
    useState<CareerReview[]>(careerReviews);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const courseMap = useMemo(
    () => new Map(courses.map((course) => [course.id, course])),
    [courses]
  );

  const filteredReviews = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return reviews;
    }

    return reviews.filter((review) => {
      const courseTitle =
        courseMap.get(review.course_id)?.title ?? "";

      return [
        review.title,
        review.description,
        review.youtube_url,
        review.income_text,
        getCareerTypeLabel(review.career_type),
        courseTitle,
        getStatusLabel(review.status),
      ].some((value) =>
        value.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [courseMap, reviews, search]);

  async function deleteReview(review: CareerReview) {
    const confirmed = window.confirm(
      `ลบคลิปรีวิว "${review.title}" ใช่ไหม?`
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(review.id);
    setMessage("");
    setErrorMessage("");

    const { error } = await supabase
      .from("career_reviews")
      .delete()
      .eq("id", review.id);

    if (error) {
      setErrorMessage(error.message);
    } else {
      setReviews((currentReviews) =>
        currentReviews.filter((item) => item.id !== review.id)
      );
      setMessage("ลบคลิปรีวิวสำเร็จ");
      router.refresh();
    }

    setDeletingId("");
  }

  return (
    <Card>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#171B18]">
              คลิปรีวิวอาชีพ
            </h2>

            <p className="mt-2 leading-7 text-[#282B28]/75">
              ค้นหา ดูตัวอย่าง แก้ไข หรือลบคลิปรีวิวอาชีพที่แอดมินสร้างไว้
            </p>
          </div>

          <Link
            href="/admin/career-reviews/create"
            className="inline-flex items-center justify-center rounded-xl bg-[#C63228] px-5 py-3 font-semibold text-white transition hover:bg-[#A92B23]"
          >
            เพิ่มคลิปรีวิว
          </Link>
        </div>

        <div className="rounded-3xl border border-[#171B18]/10 bg-[#FFF8EF] p-4">
          <label className="block">
            <span className="text-sm font-semibold text-[#171B18]">
              ค้นหาคลิปรีวิว
            </span>
            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="ค้นหาจากชื่ออาชีพ รายได้ ประเภท คอร์ส หรือสถานะ"
              className="mt-2 w-full rounded-2xl border border-[#171B18]/15 bg-[#FFFDF7] px-4 py-3 outline-none focus:border-[#C63228] focus:ring-2 focus:ring-[#C63228]/10"
            />
          </label>

          <p className="mt-2 text-sm text-[#282B28]/60">
            แสดง {filteredReviews.length} จาก {reviews.length} คลิป
          </p>
        </div>

        {reviews.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#171B18]/15 bg-[#FFF8EF] p-8 text-center">
            <h3 className="text-xl font-bold text-[#171B18]">
              ยังไม่มีคลิปรีวิวอาชีพ
            </h3>
            <p className="mt-2 text-[#282B28]/75">
              ไปหน้าเพิ่มคลิปรีวิว เพื่อสร้างคลิปแรกสำหรับหน้าอาชีพหลัก/อาชีพเสริม
            </p>
            <Link
              href="/admin/career-reviews/create"
              className="mt-5 inline-flex items-center justify-center rounded-xl bg-[#C63228] px-5 py-3 font-semibold text-white transition hover:bg-[#A92B23]"
            >
              เพิ่มคลิปรีวิว
            </Link>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#171B18]/15 bg-[#FFF8EF] p-8 text-center text-[#282B28]/75">
            ไม่พบคลิปรีวิวที่ตรงกับคำค้นหา
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {filteredReviews.map((review) => {
              const course = courseMap.get(review.course_id);
              const embedUrl = getYoutubeEmbedUrl(review.youtube_url);

              return (
                <article
                  key={review.id}
                  className="overflow-hidden rounded-2xl border border-[#171B18]/10 bg-[#FFF8EF] p-2 sm:rounded-3xl sm:p-4"
                >
                  <div className="aspect-video overflow-hidden rounded-xl bg-[#171B18] sm:rounded-2xl">
                    {embedUrl ? (
                      <iframe
                        src={embedUrl}
                        title={review.title}
                        className="h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center p-3 text-center text-[10px] text-white/70 sm:text-sm">
                        ไม่พบตัวอย่างคลิป
                      </div>
                    )}
                  </div>

                  <div className="mt-2 space-y-2 sm:mt-4">
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      <span className="rounded-full bg-[#C63228]/10 px-2 py-1 text-[10px] font-bold text-[#C63228] sm:px-3 sm:text-xs">
                        {getCareerTypeLabel(review.career_type)}
                      </span>
                      <span className="rounded-full bg-[#171B18] px-2 py-1 text-[10px] font-bold text-white sm:px-3 sm:text-xs">
                        {getStatusLabel(review.status)}
                      </span>
                    </div>

                    <h3 className="line-clamp-2 text-xs font-bold leading-5 text-[#171B18] sm:text-lg">
                      {review.title}
                    </h3>

                    <p className="hidden line-clamp-2 text-sm leading-6 text-[#282B28]/75 sm:block">
                      {review.description}
                    </p>

                    <div className="grid gap-1 text-[11px] text-[#282B28]/70 sm:text-sm">
                      <p className="line-clamp-1">
                        <span className="font-semibold text-[#171B18]">
                          รายได้:
                        </span>{" "}
                        {review.income_text}
                      </p>
                      <p className="line-clamp-1">
                        <span className="font-semibold text-[#171B18]">
                          คอร์ส:
                        </span>{" "}
                        {course?.title ?? "ไม่พบคอร์ส"}
                      </p>
                    </div>

                    <div className="flex gap-1 sm:gap-2">
                      <Link
                        href={`/admin/career-reviews/${review.id}/edit`}
                        className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl border border-[#171B18]/15 bg-[#FFFDF7] px-2 py-2 text-xs font-semibold text-[#171B18] transition hover:bg-[#C63228]/10 sm:gap-2 sm:px-3 sm:text-sm"
                      >
                        <Pencil size={16} />
                        แก้ไข
                      </Link>

                      <button
                        type="button"
                        onClick={() => void deleteReview(review)}
                        disabled={deletingId === review.id}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-200 bg-[#FFFDF7] text-[#C63228] transition hover:bg-[#C63228]/10 disabled:opacity-60 sm:h-10 sm:w-10"
                        aria-label="ลบคลิปรีวิว"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

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
      </div>
    </Card>
  );
}
