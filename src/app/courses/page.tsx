import Image from "next/image";
import Link from "next/link";

import LogoutButton from "@/components/student/LogoutButton";
import StudentCourseCard from "@/components/student/StudentCourseCard";
import { createClient } from "@/lib/supabase/server";
import type { Course } from "@/types/course";

const goalCopy = {
  primary: {
    title: "อาชีพหลัก",
    description:
      "คอร์สสำหรับคนที่อยากวางอาชีพเกษตรเป็นรายได้หลัก",
  },
  secondary: {
    title: "อาชีพเสริม",
    description:
      "คอร์สสำหรับเริ่มทำอาชีพเสริมจากพื้นที่และเวลาที่มี",
  },
  income: {
    title: "รายได้ที่คาดหวัง",
    description:
      "สำรวจคอร์สที่ช่วยต่อยอดแผนรายได้ในอนาคต",
  },
  all: {
    title: "อาชีพทั้งหมด",
    description:
      "รวมคอร์สอาชีพเกษตรที่เปิดให้เรียนใน RED TOH",
  },
};

function getSearchValue(
  value: string | string[] | undefined
) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function getDashboardHref(role: string | null) {
  if (role === "admin") {
    return "/admin/dashboard";
  }

  if (role === "farmer") {
    return "/farmer/dashboard";
  }

  if (role === "farmer_pending") {
    return "/farmer/pending";
  }

  return "/student/dashboard";
}

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{
    goal?: string | string[];
    search?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const goal = getSearchValue(params.goal);
  const search = getSearchValue(params.search).trim();
  const activeGoal =
    goal === "primary" ||
    goal === "secondary" ||
    goal === "income"
      ? goal
      : "all";

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle<{ role: string }>()
    : { data: null };

  const dashboardHref = getDashboardHref(
    profile?.role ?? null
  );
  const isStudent = profile?.role === "student";

  const { data: courses } = await supabase
    .from("courses")
    .select(
      "id,user_id,title,description,image_url,status,created_at,updated_at"
    )
    .eq("status", "published")
    .order("created_at", {
      ascending: false,
    })
    .returns<Course[]>();

  const filteredCourses = (courses ?? []).filter(
    (course) => {
      if (!search) {
        return true;
      }

      const normalizedSearch = search.toLowerCase();

      return (
        course.title
          .toLowerCase()
          .includes(normalizedSearch) ||
        course.description
          .toLowerCase()
          .includes(normalizedSearch)
      );
    }
  );

  const copy = goalCopy[activeGoal];

  return (
    <main className="min-h-screen bg-[#F5F1E8]">
      <header className="border-b border-[#171B18]/10 bg-[#FFFDF7]">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <Image
              src="/logo.png"
              width={48}
              height={48}
              alt="RED TOH Logo"
            />
            <span className="text-2xl font-bold text-[#171B18]">
              RED TOH
            </span>
          </Link>

          <nav className="flex items-center gap-2 text-sm font-semibold">
            <Link
              href="/"
              className="rounded-xl px-3 py-2 text-[#171B18] hover:bg-[#C63228]/10"
            >
              หน้าแรก
            </Link>

            {user ? (
              <>
                <Link
                  href={dashboardHref}
                  className="rounded-xl px-3 py-2 text-[#171B18] hover:bg-[#C63228]/10"
                >
                  หน้าผู้เรียน
                </Link>

                {isStudent && (
                  <Link
                    href="/student/courses"
                    className="hidden rounded-xl bg-[#C63228] px-4 py-2 text-white hover:bg-[#A92B23] sm:inline-flex"
                  >
                    คอร์สของฉัน
                  </Link>
                )}

                <LogoutButton />
              </>
            ) : (
              <>
                <Link
                  href="/register"
                  className="hidden rounded-xl border border-[#C63228] px-4 py-2 text-[#171B18] hover:bg-[#C63228]/10 sm:inline-flex"
                >
                  สมัครสมาชิก
                </Link>

                <Link
                  href="/login"
                  className="rounded-xl bg-[#C63228] px-4 py-2 text-white"
                >
                  เข้าสู่ระบบ
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/"
            className="text-sm font-semibold text-[#171B18] hover:underline"
          >
            กลับหน้าแรก
          </Link>

          <h1 className="mt-4 text-3xl font-bold text-[#171B18] md:text-4xl">
            {copy.title}
          </h1>

          <p className="mt-3 max-w-2xl leading-7 text-[#282B28]/75">
            {copy.description}
          </p>
        </div>

        <form
          action="/courses"
          className="mb-8 flex flex-col gap-3 rounded-3xl border border-[#171B18]/10 bg-[#FFFDF7] p-4 shadow-sm sm:flex-row"
        >
          <input
            name="search"
            defaultValue={search}
            placeholder="ค้นหาอาชีพหรือคอร์ส"
            className="min-h-12 flex-1 rounded-2xl border border-[#171B18]/15 px-4 outline-none focus:border-[#C63228] focus:ring-2 focus:ring-[#C63228]/10"
          />
          <input
            type="hidden"
            name="goal"
            value={activeGoal}
          />
          <button className="rounded-2xl bg-[#C63228] px-6 py-3 font-semibold text-white">
            ค้นหา
          </button>
        </form>

        {filteredCourses.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#171B18]/15 bg-[#FFFDF7] p-10 text-center text-[#282B28]/75">
            ไม่พบอาชีพหรือคอร์สที่ตรงกับการค้นหา
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {filteredCourses.map((course) => (
              <StudentCourseCard
                key={course.id}
                course={course}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
