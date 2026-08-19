"use client";

import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { FormEvent } from "react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";
import { isValidYoutubeUrl } from "@/lib/youtube";
import type { Course } from "@/types/course";
import type {
  CareerReview,
  CareerReviewStatus,
  CareerReviewType,
} from "@/types/careerReview";

interface AdminCareerReviewsFormProps {
  courses: Course[];
  careerReviews: CareerReview[];
}

interface CareerReviewDraft {
  id: string;
  persisted: boolean;
  title: string;
  description: string;
  youtubeUrl: string;
  incomeText: string;
  careerType: CareerReviewType;
  courseId: string;
  status: CareerReviewStatus;
}

interface CareerReviewInsert {
  title: string;
  description: string;
  youtube_url: string;
  income_text: string;
  career_type: CareerReviewType;
  course_id: string;
  status: CareerReviewStatus;
}

const emptyReview = (
  courseId: string
): CareerReviewDraft => ({
  id: `new-${crypto.randomUUID()}`,
  persisted: false,
  title: "",
  description: "",
  youtubeUrl: "",
  incomeText: "",
  careerType: "primary",
  courseId,
  status: "published",
});

function toDraft(review: CareerReview): CareerReviewDraft {
  return {
    id: review.id,
    persisted: true,
    title: review.title,
    description: review.description,
    youtubeUrl: review.youtube_url,
    incomeText: review.income_text,
    careerType: review.career_type,
    courseId: review.course_id,
    status: review.status,
  };
}

function toPayload(
  review: CareerReviewDraft
): CareerReviewInsert {
  return {
    title: review.title.trim(),
    description: review.description.trim(),
    youtube_url: review.youtubeUrl.trim(),
    income_text: review.incomeText.trim(),
    career_type: review.careerType,
    course_id: review.courseId,
    status: review.status,
  };
}

export default function AdminCareerReviewsForm({
  courses,
  careerReviews,
}: AdminCareerReviewsFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [reviews, setReviews] = useState<CareerReviewDraft[]>(
    careerReviews.map(toDraft)
  );
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const filteredReviews = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return reviews;
    }

    const courseMap = new Map(
      courses.map((course) => [course.id, course.title])
    );

    return reviews.filter((review) => {
      const courseTitle = courseMap.get(review.courseId) ?? "";
      const careerTypeLabel =
        review.careerType === "primary"
          ? "อาชีพหลัก"
          : "อาชีพเสริม";

      return [
        review.title,
        review.description,
        review.youtubeUrl,
        review.incomeText,
        careerTypeLabel,
        courseTitle,
        review.status === "published"
          ? "เผยแพร่"
          : "แบบร่าง",
      ].some((value) =>
        value.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [courses, reviews, search]);

  function updateReview(
    id: string,
    values: Partial<CareerReviewDraft>
  ) {
    setReviews((currentReviews) =>
      currentReviews.map((review) =>
        review.id === id
          ? {
              ...review,
              ...values,
            }
          : review
      )
    );
    setMessage("");
    setErrorMessage("");
  }

  function addReview() {
    setReviews((currentReviews) => [
      emptyReview(courses[0]?.id ?? ""),
      ...currentReviews,
    ]);
    setSearch("");
    setMessage("");
    setErrorMessage("");
  }

  async function deleteReview(review: CareerReviewDraft) {
    const confirmed = window.confirm(
      `ลบคลิปรีวิว "${review.title || "รายการนี้"}" ใช่ไหม?`
    );

    if (!confirmed) {
      return;
    }

    if (!review.persisted) {
      setReviews((currentReviews) =>
        currentReviews.filter((item) => item.id !== review.id)
      );
      return;
    }

    setSaving(true);
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

    setSaving(false);
  }

  function validateReview(review: CareerReviewDraft) {
    if (!review.title.trim()) {
      return "กรุณากรอกชื่ออาชีพ/ชื่อคลิปรีวิว";
    }

    if (!review.description.trim()) {
      return "กรุณากรอกรายละเอียดว่าอาชีพนี้ทำประมาณไหน";
    }

    if (!review.youtubeUrl.trim()) {
      return "กรุณาใส่ลิงก์ YouTube สำหรับคลิปรีวิว";
    }

    if (!isValidYoutubeUrl(review.youtubeUrl.trim())) {
      return "ลิงก์คลิปต้องเป็น YouTube ที่ถูกต้อง";
    }

    if (!review.incomeText.trim()) {
      return "กรุณากรอกรายได้โดยประมาณ";
    }

    if (!review.courseId) {
      return "กรุณาเลือกคอร์สที่เกี่ยวข้อง";
    }

    return null;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setErrorMessage("");

    try {
      if (courses.length === 0) {
        throw new Error(
          "ยังไม่มีคอร์สให้เชื่อมโยง กรุณาให้ฟาร์มเมอร์สร้างคอร์สก่อน"
        );
      }

      for (const review of reviews) {
        const error = validateReview(review);

        if (error) {
          throw new Error(error);
        }
      }

      for (const review of reviews) {
        const payload = toPayload(review);

        if (review.persisted) {
          const { error } = await supabase
            .from("career_reviews")
            .update(payload)
            .eq("id", review.id);

          if (error) {
            throw new Error(error.message);
          }
        } else {
          const { error } = await supabase
            .from("career_reviews")
            .insert(payload);

          if (error) {
            throw new Error(error.message);
          }
        }
      }

      setMessage("บันทึกคลิปรีวิวอาชีพสำเร็จ");
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "บันทึกคลิปรีวิวไม่สำเร็จ"
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
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#171B18]">
              คลิปรีวิวอาชีพ
            </h2>

            <p className="mt-2 leading-7 text-[#282B28]/75">
              เพิ่มคลิปแนะนำอาชีพ กรอกรายได้โดยประมาณ และเชื่อมไปยังคอร์สที่ฟาร์มเมอร์ลงไว้
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={addReview}
            disabled={saving || courses.length === 0}
            className="gap-2"
          >
            <Plus size={18} />
            เพิ่มคลิปรีวิว
          </Button>
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

        {courses.length === 0 && (
          <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
            ยังไม่มีคอร์สที่เผยแพร่ให้เลือก กรุณาให้ฟาร์มเมอร์สร้างคอร์สก่อน
          </p>
        )}

        {reviews.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#171B18]/15 bg-[#FFF8EF] p-8 text-center">
            <h3 className="text-xl font-bold text-[#171B18]">
              ยังไม่มีคลิปรีวิวอาชีพ
            </h3>
            <p className="mt-2 text-[#282B28]/75">
              กดปุ่มเพิ่มคลิปรีวิว เพื่อสร้างคลิปแรกสำหรับหน้าอาชีพหลัก/อาชีพเสริม
            </p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#171B18]/15 bg-[#FFF8EF] p-8 text-center text-[#282B28]/75">
            ไม่พบคลิปรีวิวที่ตรงกับคำค้นหา
          </div>
        ) : (
          <div className="space-y-5">
            {filteredReviews.map((review, index) => (
            <div
              key={review.id}
              className="rounded-3xl border border-[#171B18]/10 bg-[#FFF8EF] p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-[#171B18]">
                    คลิปรีวิวที่ {filteredReviews.length - index}
                  </h3>
                  <p className="mt-1 text-sm text-[#282B28]/60">
                    ใช้สำหรับหน้าอาชีพหลัก / อาชีพเสริม / รายได้ที่คาดหวัง
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => void deleteReview(review)}
                  disabled={saving}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-red-200 bg-[#FFFDF7] text-[#C63228] transition hover:bg-[#C63228]/10 disabled:opacity-60"
                  aria-label="ลบคลิปรีวิว"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-semibold text-[#171B18]">
                    ชื่ออาชีพ / ชื่อคลิป
                  </span>
                  <input
                    value={review.title}
                    onChange={(event) =>
                      updateReview(review.id, {
                        title: event.target.value,
                      })
                    }
                    disabled={saving}
                    placeholder="เช่น ปลูกผักไฮโดรโปนิกส์"
                    className="mt-2 w-full rounded-2xl border border-[#171B18]/15 bg-[#FFFDF7] px-4 py-3 outline-none focus:border-[#C63228] focus:ring-2 focus:ring-[#C63228]/10"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-[#171B18]">
                    รายได้โดยประมาณ
                  </span>
                  <input
                    value={review.incomeText}
                    onChange={(event) =>
                      updateReview(review.id, {
                        incomeText: event.target.value,
                      })
                    }
                    disabled={saving}
                    placeholder="เช่น 15,000 - 30,000 บาท/เดือน"
                    className="mt-2 w-full rounded-2xl border border-[#171B18]/15 bg-[#FFFDF7] px-4 py-3 outline-none focus:border-[#C63228] focus:ring-2 focus:ring-[#C63228]/10"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-[#171B18]">
                    ประเภทอาชีพ
                  </span>
                  <select
                    value={review.careerType}
                    onChange={(event) =>
                      updateReview(review.id, {
                        careerType: event.target
                          .value as CareerReviewType,
                      })
                    }
                    disabled={saving}
                    className="mt-2 w-full rounded-2xl border border-[#171B18]/15 bg-[#FFFDF7] px-4 py-3 outline-none focus:border-[#C63228] focus:ring-2 focus:ring-[#C63228]/10"
                  >
                    <option value="primary">
                      อาชีพหลัก
                    </option>
                    <option value="secondary">
                      อาชีพเสริม
                    </option>
                  </select>
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-[#171B18]">
                    คอร์สที่เกี่ยวข้อง
                  </span>
                  <select
                    value={review.courseId}
                    onChange={(event) =>
                      updateReview(review.id, {
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
                </label>

                <label className="block lg:col-span-2">
                  <span className="text-sm font-semibold text-[#171B18]">
                    YouTube URL คลิปรีวิวอาชีพ
                  </span>
                  <input
                    type="url"
                    value={review.youtubeUrl}
                    onChange={(event) =>
                      updateReview(review.id, {
                        youtubeUrl: event.target.value,
                      })
                    }
                    disabled={saving}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="mt-2 w-full rounded-2xl border border-[#171B18]/15 bg-[#FFFDF7] px-4 py-3 outline-none focus:border-[#C63228] focus:ring-2 focus:ring-[#C63228]/10"
                  />
                </label>

                <label className="block lg:col-span-2">
                  <span className="text-sm font-semibold text-[#171B18]">
                    รายละเอียดอาชีพ
                  </span>
                  <textarea
                    value={review.description}
                    onChange={(event) =>
                      updateReview(review.id, {
                        description: event.target.value,
                      })
                    }
                    disabled={saving}
                    rows={4}
                    placeholder="เล่าว่าอาชีพนี้ทำประมาณไหน เหมาะกับใคร ต้องเตรียมอะไรบ้าง"
                    className="mt-2 w-full resize-none rounded-2xl border border-[#171B18]/15 bg-[#FFFDF7] px-4 py-3 leading-7 outline-none focus:border-[#C63228] focus:ring-2 focus:ring-[#C63228]/10"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-[#171B18]">
                    สถานะ
                  </span>
                  <select
                    value={review.status}
                    onChange={(event) =>
                      updateReview(review.id, {
                        status: event.target
                          .value as CareerReviewStatus,
                      })
                    }
                    disabled={saving}
                    className="mt-2 w-full rounded-2xl border border-[#171B18]/15 bg-[#FFFDF7] px-4 py-3 outline-none focus:border-[#C63228] focus:ring-2 focus:ring-[#C63228]/10"
                  >
                    <option value="published">
                      เผยแพร่
                    </option>
                    <option value="draft">
                      แบบร่าง
                    </option>
                  </select>
                </label>
              </div>
            </div>
            ))}
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

        <div className="flex justify-end border-t border-[#171B18]/10 pt-6">
          <Button
            type="submit"
            disabled={saving || courses.length === 0}
          >
            {saving
              ? "กำลังบันทึก..."
              : "บันทึกคลิปรีวิวอาชีพ"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
