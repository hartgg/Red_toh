"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";
import {
  getYoutubeEmbedUrl,
  isValidYoutubeUrl,
} from "@/lib/youtube";
import type {
  CareerReviewStatus,
  CareerReviewType,
} from "@/types/careerReview";
import type { Course } from "@/types/course";

interface AdminCareerReviewCreateFormProps {
  courses: Course[];
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

export default function AdminCareerReviewCreateForm({
  courses,
}: AdminCareerReviewCreateFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [incomeText, setIncomeText] = useState("");
  const [careerType, setCareerType] =
    useState<CareerReviewType>("primary");
  const [courseId, setCourseId] = useState(
    courses[0]?.id ?? ""
  );
  const [status, setStatus] =
    useState<CareerReviewStatus>("published");
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const embedUrl = getYoutubeEmbedUrl(youtubeUrl);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setErrorMessage("");

    try {
      if (courses.length === 0) {
        throw new Error(
          "ยังไม่มีคอร์สให้เชื่อมโยง กรุณาให้ฟาร์มเมอร์สร้างคอร์สก่อน"
        );
      }

      if (!title.trim()) {
        throw new Error("กรุณากรอกชื่ออาชีพ/ชื่อคลิปรีวิว");
      }

      if (!description.trim()) {
        throw new Error(
          "กรุณากรอกรายละเอียดว่าอาชีพนี้ทำประมาณไหน"
        );
      }

      if (!youtubeUrl.trim()) {
        throw new Error("กรุณาใส่ลิงก์ YouTube สำหรับคลิปรีวิว");
      }

      if (!isValidYoutubeUrl(youtubeUrl.trim())) {
        throw new Error("ลิงก์คลิปต้องเป็น YouTube ที่ถูกต้อง");
      }

      if (!incomeText.trim()) {
        throw new Error("กรุณากรอกรายได้โดยประมาณ");
      }

      if (!courseId) {
        throw new Error("กรุณาเลือกคอร์สที่เกี่ยวข้อง");
      }

      const payload: CareerReviewInsert = {
        title: title.trim(),
        description: description.trim(),
        youtube_url: youtubeUrl.trim(),
        income_text: incomeText.trim(),
        career_type: careerType,
        course_id: courseId,
        status,
      };

      const { error } = await supabase
        .from("career_reviews")
        .insert(payload);

      if (error) {
        throw new Error(error.message);
      }

      router.replace("/admin/career-reviews");
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "เพิ่มคลิปรีวิวไม่สำเร็จ"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <form
        onSubmit={handleSubmit}
        className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]"
      >
        <div className="space-y-5">
          <label className="block">
            <span className="text-sm font-semibold text-[#171B18]">
              ชื่ออาชีพ / ชื่อคลิป
            </span>
            <input
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              disabled={saving}
              placeholder="เช่น ปลูกผักไฮโดรโปนิกส์"
              className="mt-2 w-full rounded-2xl border border-[#171B18]/15 bg-[#FFFDF7] px-4 py-3 outline-none focus:border-[#C63228] focus:ring-2 focus:ring-[#C63228]/10"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-[#171B18]">
              YouTube URL คลิปรีวิวอาชีพ
            </span>
            <input
              type="url"
              value={youtubeUrl}
              onChange={(event) =>
                setYoutubeUrl(event.target.value)
              }
              disabled={saving}
              placeholder="https://www.youtube.com/watch?v=..."
              className="mt-2 w-full rounded-2xl border border-[#171B18]/15 bg-[#FFFDF7] px-4 py-3 outline-none focus:border-[#C63228] focus:ring-2 focus:ring-[#C63228]/10"
            />
          </label>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-[#171B18]">
                รายได้โดยประมาณ
              </span>
              <input
                value={incomeText}
                onChange={(event) =>
                  setIncomeText(event.target.value)
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
                value={careerType}
                onChange={(event) =>
                  setCareerType(
                    event.target.value as CareerReviewType
                  )
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
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-[#171B18]">
                คอร์สที่เกี่ยวข้อง
              </span>
              <select
                value={courseId}
                onChange={(event) =>
                  setCourseId(event.target.value)
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

            <label className="block">
              <span className="text-sm font-semibold text-[#171B18]">
                สถานะ
              </span>
              <select
                value={status}
                onChange={(event) =>
                  setStatus(
                    event.target.value as CareerReviewStatus
                  )
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

          <label className="block">
            <span className="text-sm font-semibold text-[#171B18]">
              รายละเอียดอาชีพ
            </span>
            <textarea
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              disabled={saving}
              rows={6}
              placeholder="เล่าว่าอาชีพนี้ทำประมาณไหน เหมาะกับใคร ต้องเตรียมอะไรบ้าง"
              className="mt-2 w-full resize-none rounded-2xl border border-[#171B18]/15 bg-[#FFFDF7] px-4 py-3 leading-7 outline-none focus:border-[#C63228] focus:ring-2 focus:ring-[#C63228]/10"
            />
          </label>

          {courses.length === 0 && (
            <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
              ยังไม่มีคอร์สที่เผยแพร่ให้เลือก กรุณาให้ฟาร์มเมอร์สร้างคอร์สก่อน
            </p>
          )}

          {errorMessage && (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </p>
          )}

          <div className="flex flex-col gap-3 border-t border-[#171B18]/10 pt-5 sm:flex-row sm:justify-end">
            <Link
              href="/admin/career-reviews"
              className="inline-flex items-center justify-center rounded-xl border border-[#171B18]/15 px-5 py-3 font-semibold text-[#171B18] transition hover:bg-[#C63228]/10"
            >
              ยกเลิก
            </Link>

            <Button
              type="submit"
              disabled={saving || courses.length === 0}
            >
              {saving ? "กำลังบันทึก..." : "บันทึกคลิปรีวิว"}
            </Button>
          </div>
        </div>

        <aside className="rounded-3xl border border-[#171B18]/10 bg-[#FFF8EF] p-4">
          <h2 className="text-xl font-bold text-[#171B18]">
            ตัวอย่างคลิป
          </h2>

          <div className="mt-4 aspect-video overflow-hidden rounded-2xl bg-[#171B18]">
            {embedUrl ? (
              <iframe
                src={embedUrl}
                title={title || "ตัวอย่างคลิปรีวิวอาชีพ"}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            ) : (
              <div className="flex h-full items-center justify-center p-6 text-center text-white/70">
                ใส่ลิงก์ YouTube แล้วตัวอย่างคลิปจะแสดงตรงนี้
              </div>
            )}
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-[#C63228]/10 px-3 py-1 text-xs font-bold text-[#C63228]">
                {careerType === "primary"
                  ? "อาชีพหลัก"
                  : "อาชีพเสริม"}
              </span>
              <span className="rounded-full bg-[#171B18] px-3 py-1 text-xs font-bold text-white">
                {status === "published"
                  ? "เผยแพร่"
                  : "แบบร่าง"}
              </span>
            </div>

            <h3 className="line-clamp-2 text-lg font-bold text-[#171B18]">
              {title || "ชื่อคลิปรีวิวจะแสดงตรงนี้"}
            </h3>

            <p className="text-sm leading-6 text-[#282B28]/75">
              รายได้ {incomeText || "ระบุรายได้โดยประมาณ"}
            </p>
          </div>
        </aside>
      </form>
    </Card>
  );
}
