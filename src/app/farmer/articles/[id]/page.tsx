import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Container from "@/components/ui/Container";
import { createClient } from "@/lib/supabase/server";
import { getYoutubeEmbedUrl } from "@/lib/youtube";
import type { Course, Lesson } from "@/types/course";

interface Profile {
  email: string | null;
  full_name: string | null;
}

interface Farmer {
  full_name: string | null;
  province: string | null;
  farm_area: string | null;
  agriculture_type: string | null;
}

function getStatusLabel(status: Course["status"]) {
  return status === "published" ? "เผยแพร่" : "Draft";
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: course } = await supabase
    .from("courses")
    .select(
      "id,user_id,title,description,image_url,status,created_at,updated_at"
    )
    .eq("id", id)
    .single<Course>();

  if (!course) {
    notFound();
  }

  const { data: lessons } = await supabase
    .from("lessons")
    .select(
      "id,course_id,title,description,youtube_url,lesson_order,created_at,updated_at"
    )
    .eq("course_id", course.id)
    .order("lesson_order", {
      ascending: true,
    })
    .returns<Lesson[]>();

  const { data: author } = await supabase
    .from("profiles")
    .select("email, full_name")
    .eq("id", course.user_id)
    .single<Profile>();

  const { data: farmer } = await supabase
    .from("farmers")
    .select(
      `
      full_name,
      province,
      farm_area,
      agriculture_type
      `
    )
    .eq("user_id", course.user_id)
    .single<Farmer>();

  const courseLessons = lessons ?? [];
  const isOwner = user?.id === course.user_id;

  return (
    <Container className="py-8">
      <Card className="overflow-hidden p-0">
        <div className="relative h-[420px]">
          {course.image_url ? (
            <Image
              src={course.image_url}
              alt={course.title}
              fill
              sizes="100vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-[#2E7D32]/10 text-[#282B28]/45">
              ไม่มีรูปภาพคอร์ส
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

          <div className="absolute bottom-0 p-8 text-white">
            <div className="mb-4 flex flex-wrap gap-3">
              <span className="rounded-full bg-[#D4AF37] px-4 py-2 text-sm font-semibold">
                Beginner
              </span>

              <span className="rounded-full bg-[#FFFDF7]/90 px-4 py-2 text-sm font-semibold text-[#171B18]">
                {getStatusLabel(course.status)}
              </span>
            </div>

            <h1 className="text-3xl font-bold md:text-5xl">
              {course.title}
            </h1>

            <div className="mt-4 flex flex-wrap gap-6 text-sm text-gray-200">
              <span>
                วันที่สร้าง{" "}
                {new Date(
                  course.created_at
                ).toLocaleDateString("th-TH")}
              </span>

              <span>
                {courseLessons.length} บทเรียน
              </span>

              <span>ผู้เรียน 0 คน</span>
            </div>
          </div>
        </div>
      </Card>

      {isOwner && (
        <div className="mt-6">
          <Link
            href={`/farmer/articles/${course.id}/edit`}
          >
            <Button>แก้ไขคอร์ส</Button>
          </Link>
        </div>
      )}

      <Card className="mt-8">
        <h2 className="text-2xl font-bold text-[#171B18]">
          ผู้สอน
        </h2>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-[#282B28]/60">
              ชื่อเกษตรกร
            </p>

            <p className="font-semibold">
              {farmer?.full_name ||
                author?.full_name ||
                author?.email ||
                "-"}
            </p>
          </div>

          <div>
            <p className="text-sm text-[#282B28]/60">
              จังหวัด
            </p>

            <p className="font-semibold">
              {farmer?.province || "-"}
            </p>
          </div>

          <div>
            <p className="text-sm text-[#282B28]/60">
              อาชีพเกษตร
            </p>

            <p className="font-semibold">
              {farmer?.agriculture_type || "-"}
            </p>
          </div>

          <div>
            <p className="text-sm text-[#282B28]/60">
              พื้นที่ฟาร์ม
            </p>

            <p className="font-semibold">
              {farmer?.farm_area || "-"}
            </p>
          </div>
        </div>
      </Card>

      <Card className="mt-6">
        <h2 className="text-2xl font-bold text-[#171B18]">
          รายละเอียดคอร์ส
        </h2>

        <p className="mt-4 whitespace-pre-line leading-8 text-[#282B28]">
          {course.description}
        </p>
      </Card>

      <Card className="mt-6">
        <h2 className="text-2xl font-bold text-[#171B18]">
          เนื้อหาในคอร์ส
        </h2>

        {courseLessons.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-[#2E7D32]/25 bg-[#2E7D32]/10 p-5 text-[#282B28]/75">
            คอร์สนี้ยังไม่มีบทเรียน
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {courseLessons.map((lesson, index) => {
              const youtubeEmbedUrl = getYoutubeEmbedUrl(
                lesson.youtube_url
              );

              return (
                <div
                  key={lesson.id}
                  className="rounded-2xl border border-[#2E7D32]/15 bg-[#2E7D32]/10 p-5"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="font-bold text-[#171B18]">
                        บทเรียนที่ {index + 1}:{" "}
                        {lesson.title}
                      </h3>

                      {lesson.description && (
                        <p className="mt-2 whitespace-pre-line text-sm leading-7 text-[#282B28]/75">
                          {lesson.description}
                        </p>
                      )}
                    </div>

                    <span className="shrink-0 rounded-full bg-[#FFFDF7] px-3 py-1 text-xs font-semibold text-[#171B18]">
                      ลำดับที่ {lesson.lesson_order}
                    </span>
                  </div>

                  {youtubeEmbedUrl && (
                    <div className="mt-5 overflow-hidden rounded-2xl bg-black">
                      <iframe
                        src={youtubeEmbedUrl}
                        title={lesson.title}
                        allowFullScreen
                        className="aspect-video w-full"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </Container>
  );
}
