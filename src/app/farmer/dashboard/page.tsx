import Link from "next/link";
import { BookOpen, PlayCircle, Users } from "lucide-react";

import { requireFarmer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

import RecentCourse from "@/components/dashboard/RecentCourse";
import StatCard from "@/components/dashboard/StatCard";
import WelcomeBanner from "@/components/dashboard/WelcomeBanner";
import type { Course } from "@/types/course";

export default async function FarmerDashboard() {
  const { user, profile } = await requireFarmer();
  const supabase = await createClient();

  const { data: farmer } = await supabase
    .from("farmers")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const { data: courses } = await supabase
    .from("courses")
    .select(
      "id,user_id,title,description,image_url,status,created_at,updated_at"
    )
    .eq("user_id", user.id)
    .order("created_at", {
      ascending: false,
    })
    .returns<Course[]>();

  const courseIds = courses?.map((course) => course.id) ?? [];

  const { count: lessonCount } =
    courseIds.length > 0
      ? await supabase
          .from("lessons")
          .select("id", {
            count: "exact",
            head: true,
          })
          .in("course_id", courseIds)
      : { count: 0 };

  const totalCourses = courses?.length ?? 0;
  const totalLessons = lessonCount ?? 0;

  return (
    <div className="space-y-8">
      <WelcomeBanner
        name={
          farmer?.full_name ??
          profile.full_name ??
          profile.email
        }
      />

      <div className="grid gap-6 md:grid-cols-3">
        <StatCard
          title="คอร์สทั้งหมด"
          value={totalCourses}
          icon={<BookOpen size={28} />}
        />

        <StatCard
          title="ผู้เรียน"
          value={0}
          icon={<Users size={28} />}
          color="bg-blue-600"
        />

        <StatCard
          title="บทเรียน"
          value={totalLessons}
          icon={<PlayCircle size={28} />}
          color="bg-amber-500"
        />
      </div>

      <RecentCourse courses={courses ?? []} />

      <div className="rounded-3xl border border-[#171B18]/10 bg-[#FFFDF7] p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#171B18]">
            ข้อมูลเกษตรกร
          </h2>

          <Link
            href="/farmer/profile"
            className="text-sm font-medium text-[#171B18] hover:underline"
          >
            แก้ไขข้อมูล
          </Link>
        </div>

        {farmer ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-[#282B28]/60">
                ชื่อ
              </p>

              <p className="font-semibold">
                {farmer.full_name}
              </p>
            </div>

            <div>
              <p className="text-sm text-[#282B28]/60">
                เบอร์โทร
              </p>

              <p className="font-semibold">
                {farmer.phone}
              </p>
            </div>

            <div>
              <p className="text-sm text-[#282B28]/60">
                จังหวัด
              </p>

              <p className="font-semibold">
                {farmer.province}
              </p>
            </div>

            <div>
              <p className="text-sm text-[#282B28]/60">
                พื้นที่ทำการเกษตร
              </p>

              <p className="font-semibold">
                {farmer.farm_area}
              </p>
            </div>

            <div>
              <p className="text-sm text-[#282B28]/60">
                อาชีพทางการเกษตร
              </p>

              <p className="font-semibold">
                {farmer.agriculture_type}
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-[#F5F1E8] p-8 text-center">
            <p className="mb-4 text-[#282B28]/75">
              ยังไม่มีข้อมูลเกษตรกร
            </p>

            <Link
              href="/farmer/profile"
              className="rounded-xl bg-[#C63228] px-5 py-3 text-white hover:bg-[#A92B23]"
            >
              เพิ่มข้อมูลเกษตรกร
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
