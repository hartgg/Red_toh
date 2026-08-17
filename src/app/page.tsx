import Image from "next/image";
import Link from "next/link";
import { Search, UserCircle } from "lucide-react";

import LogoutButton from "@/components/student/LogoutButton";
import PopularCareerCarousel from "@/components/student/PopularCareerCarousel";
import type { PopularCareerSlide } from "@/components/student/PopularCareerCarousel";
import StudentCourseCard from "@/components/student/StudentCourseCard";
import { createClient } from "@/lib/supabase/server";
import type { Course } from "@/types/course";
import type { FeaturedCareer } from "@/types/featuredCareer";
import type {
  HomepageGoalCardImage,
  HomepageGoalKey,
} from "@/types/homepageGoalCard";

const goalCards: Array<{
  goal: HomepageGoalKey;
  title: string;
  href: string;
}> = [
  {
    goal: "primary",
    title: "อาชีพหลัก",
    href: "/courses?goal=primary",
  },
  {
    goal: "secondary",
    title: "อาชีพเสริม",
    href: "/courses?goal=secondary",
  },
  {
    goal: "income",
    title: "รายได้ที่คาดหวัง",
    href: "/courses?goal=income",
  },
];

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

function toSlides(
  featuredCareers: FeaturedCareer[],
  courses: Course[]
): PopularCareerSlide[] {
  const courseMap = new Map(
    courses.map((course) => [course.id, course])
  );

  const featuredSlides = featuredCareers
    .map((featured) => {
      const course = courseMap.get(featured.course_id);

      if (!course) {
        return null;
      }

      return {
        id: featured.id,
        title: course.title,
        description: course.description,
        imageUrl: featured.image_url ?? course.image_url,
      };
    })
    .filter((slide): slide is PopularCareerSlide =>
      Boolean(slide)
    );

  if (featuredSlides.length > 0) {
    return featuredSlides.slice(0, 3);
  }

  return courses.slice(0, 3).map((course) => ({
    id: course.id,
    title: course.title,
    description: course.description,
    imageUrl: course.image_url,
  }));
}

export default async function Home() {
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

  const publishedCourses = courses ?? [];

  const { data: featuredCareers } = await supabase
    .from("featured_careers")
    .select(
      "id,slot,course_id,image_url,created_at,updated_at"
    )
    .order("slot", {
      ascending: true,
    })
    .returns<FeaturedCareer[]>();

  const { data: goalImages } = await supabase
    .from("homepage_goal_cards")
    .select("id,goal,image_url,created_at,updated_at")
    .returns<HomepageGoalCardImage[]>();

  const goalImageMap = new Map(
    (goalImages ?? []).map((goalImage) => [
      goalImage.goal,
      goalImage.image_url,
    ])
  );

  return (
    <main className="min-h-screen bg-[#F5F1E8] text-[#171B18]">
      <header className="border-b border-white/10 bg-[#171B18] text-white">
        <div className="mx-auto flex h-20 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-3"
          >
            <Image
              src="/logo.png"
              width={48}
              height={48}
              alt="RED TOH Logo"
            />
            <span className="text-2xl font-bold text-white">
              <span className="text-[#C63228]">RED</span> TOH
            </span>
          </Link>

          <form
            action="/courses"
            className="hidden flex-1 items-center rounded-full border border-white/10 bg-white/10 px-4 py-2 md:flex"
          >
            <input
              name="search"
              type="search"
              placeholder="ค้นหาอาชีพหรือคอร์ส"
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/60"
            />
            <Search
              size={18}
              className="text-white/70"
            />
          </form>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            {user ? (
              <>
                <Link
                  href="/"
                  className="hidden rounded-xl px-4 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10 sm:inline-flex"
                >
                  หน้าแรก
                </Link>

                <Link
                  href={dashboardHref}
                  className="rounded-xl bg-[#C63228] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#A92B23]"
                >
                  หน้าผู้เรียน
                </Link>

                {isStudent && (
                  <Link
                    href="/student/courses"
                    className="hidden rounded-xl border border-white/25 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10 sm:inline-flex"
                  >
                    คอร์สของฉัน
                  </Link>
                )}

                <LogoutButton className="border-white/25 text-white hover:bg-white/10" />
              </>
            ) : (
              <>
                <Link
                  href="/register"
                  className="rounded-xl bg-[#C63228] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#A92B23]"
                >
                  สมัครสมาชิก
                </Link>

                <Link
                  href="/student/dashboard"
                  className="hidden rounded-xl border border-white/25 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10 sm:inline-flex"
                >
                  คอร์สของฉัน
                </Link>

                <Link
                  href="/student/dashboard"
                  aria-label="เข้าสู่ระบบ"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#2E7D32] text-white"
                >
                  <UserCircle size={28} />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <PopularCareerCarousel
          slides={toSlides(
            featuredCareers ?? [],
            publishedCourses
          )}
        />

        <section className="py-10">
          <h2 className="text-center text-2xl font-bold text-[#171B18] sm:text-3xl">
            เป้าหมายคุณคืออะไร
          </h2>

          <div className="mt-6 grid grid-cols-3 gap-2 sm:mt-8 sm:gap-5">
            {goalCards.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="group overflow-hidden rounded-2xl border border-[#2E7D32]/20 bg-[#171B18] shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:rounded-3xl"
              >
                <div className="relative flex aspect-video items-center justify-center overflow-hidden bg-gray-200 text-xs font-bold text-gray-500 transition group-hover:bg-green-50 sm:text-xl">
                  {goalImageMap.get(card.goal) ? (
                    <Image
                      src={goalImageMap.get(card.goal) ?? ""}
                      alt={`รูป ${card.title}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <>ใส่รูป {card.title}</>
                  )}
                </div>

                <div className="p-2 text-center sm:p-5">
                  <h3 className="text-xs font-bold text-white sm:text-2xl">
                    {card.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section
          id="all-careers"
          className="pb-12"
        >
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-3xl font-bold text-[#171B18]">
                อาชีพทั้งหมด
              </h2>

              <p className="mt-2 text-[#282B28]/75">
                เลือกเส้นทางเรียนรู้ที่เหมาะกับพื้นที่และเป้าหมายของคุณ
              </p>
            </div>

            <Link
              href="/courses"
              className="text-sm font-semibold text-[#C63228] hover:underline"
            >
              ดูอาชีพทั้งหมด
            </Link>
          </div>

          {publishedCourses.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-green-200 bg-white p-10 text-center text-gray-600">
              ยังไม่มีอาชีพที่เผยแพร่
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {publishedCourses.slice(0, 8).map((course) => (
                <StudentCourseCard
                  key={course.id}
                  course={course}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
