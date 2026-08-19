import Link from "next/link";

import { getYoutubeEmbedUrl } from "@/lib/youtube";
import type { CareerReviewWithCourse } from "@/types/careerReview";

interface CareerReviewCardProps {
  review: CareerReviewWithCourse;
}

function getCareerTypeLabel(
  careerType: CareerReviewWithCourse["career_type"]
) {
  return careerType === "primary"
    ? "อาชีพหลัก"
    : "อาชีพเสริม";
}

export default function CareerReviewCard({
  review,
}: CareerReviewCardProps) {
  const embedUrl = getYoutubeEmbedUrl(review.youtube_url);

  return (
    <article className="overflow-hidden rounded-3xl border border-[#171B18]/10 bg-[#FFFDF7] shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="aspect-video bg-[#171B18]">
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
          <div className="flex h-full items-center justify-center p-6 text-center text-white/70">
            ไม่สามารถแสดงคลิปนี้ได้
          </div>
        )}
      </div>

      <div className="space-y-4 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[#C63228]/10 px-3 py-1 text-xs font-bold text-[#C63228]">
            {getCareerTypeLabel(review.career_type)}
          </span>

          <span className="rounded-full bg-[#171B18] px-3 py-1 text-xs font-bold text-white">
            รายได้ {review.income_text}
          </span>
        </div>

        <div>
          <h2 className="line-clamp-2 text-xl font-bold text-[#171B18]">
            {review.title}
          </h2>

          <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#282B28]/75">
            {review.description}
          </p>
        </div>

        {review.courses && (
          <div className="rounded-2xl bg-[#FFF8EF] p-4">
            <p className="text-xs font-semibold text-[#282B28]/60">
              คอร์สที่เกี่ยวข้อง
            </p>
            <p className="mt-1 line-clamp-1 font-bold text-[#171B18]">
              {review.courses.title}
            </p>
          </div>
        )}

        <Link
          href={`/courses/${review.course_id}`}
          className="inline-flex w-full items-center justify-center rounded-2xl bg-[#C63228] px-5 py-3 font-bold text-white transition hover:bg-[#A92B23]"
        >
          ดูคอร์สที่เกี่ยวข้อง
        </Link>
      </div>
    </article>
  );
}
