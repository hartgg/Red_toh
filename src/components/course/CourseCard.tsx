import Image from "next/image";
import Link from "next/link";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import type { CourseListItem } from "./CourseFilter";

interface CourseCardProps {
  course: CourseListItem;
}

function getStatusLabel(status: CourseListItem["status"]) {
  return status === "published" ? "เผยแพร่" : "Draft";
}

export default function CourseCard({
  course,
}: CourseCardProps) {
  return (
    <Card className="group overflow-hidden p-0 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
      <div className="relative h-56 overflow-hidden">
        {course.image_url ? (
          <Image
            src={course.image_url}
            alt={course.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[#EEE8DD] text-[#282B28]/45">
            ไม่มีรูปภาพ
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        <div className="absolute left-4 top-4">
          <span className="rounded-full bg-[#D4AF37] px-3 py-1 text-xs font-semibold text-white">
            Beginner
          </span>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div>
          <h2 className="line-clamp-2 text-xl font-bold text-[#171B18]">
            {course.title}
          </h2>

          <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#282B28]/75">
            {course.description}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <span className="rounded-full bg-[#C63228]/15 px-3 py-1 text-xs font-medium text-[#C63228]">
            {getStatusLabel(course.status)}
          </span>

          <span className="text-xs text-[#282B28]/60">
            {new Date(course.created_at).toLocaleDateString(
              "th-TH"
            )}
          </span>
        </div>

        <div className="border-t pt-4">
          <div className="mb-4 flex items-center justify-between text-sm text-[#282B28]/60">
            <span>ผู้เรียน 0 คน</span>
            <span>คอร์สใหม่</span>
          </div>

          <div className="flex gap-3">
            <Link
              href={`/farmer/articles/${course.id}`}
              className="flex-1"
            >
              <Button className="w-full">
                ดูคอร์ส
              </Button>
            </Link>

            <Link
              href={`/farmer/articles/${course.id}/edit`}
              className="flex-1"
            >
              <Button
                variant="outline"
                className="w-full"
              >
                แก้ไข
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}
