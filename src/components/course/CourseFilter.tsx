"use client";

import { useMemo, useState } from "react";

import Pagination from "@/components/ui/Pagination";
import CourseGrid from "./CourseGrid";
import CourseToolbar from "./CourseToolbar";

export interface CourseListItem {
  id: string;
  user_id: string;
  title: string;
  description: string;
  image_url: string | null;
  status: "published" | "draft";
  created_at: string;
  updated_at: string;
}

interface CourseFilterProps {
  courses: CourseListItem[];
}

const ITEMS_PER_PAGE = 12;
const ALL_STATUS = "ทั้งหมด";
const PUBLISHED_STATUS = "เผยแพร่";
const DRAFT_STATUS = "Draft";
const NEWEST_SORT = "ล่าสุด";
const OLDEST_SORT = "เก่าสุด";
const TITLE_ASC_SORT = "ก-ฮ";
const TITLE_DESC_SORT = "ฮ-ก";

function matchesStatus(
  course: CourseListItem,
  status: string
) {
  if (status === ALL_STATUS) {
    return true;
  }

  if (status === PUBLISHED_STATUS) {
    return course.status === "published";
  }

  if (status === DRAFT_STATUS) {
    return course.status === "draft";
  }

  return true;
}

export default function CourseFilter({
  courses,
}: CourseFilterProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(ALL_STATUS);
  const [sort, setSort] = useState(NEWEST_SORT);
  const [currentPage, setCurrentPage] =
    useState(1);

  const filteredCourses = useMemo(() => {
    let result = [...courses];
    const normalizedSearch = search
      .trim()
      .toLowerCase();

    if (normalizedSearch) {
      result = result.filter((course) => {
        const title = course.title.toLowerCase();
        const description =
          course.description.toLowerCase();

        return (
          title.includes(normalizedSearch) ||
          description.includes(normalizedSearch)
        );
      });
    }

    result = result.filter((course) =>
      matchesStatus(course, status)
    );

    switch (sort) {
      case NEWEST_SORT:
        result.sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
        );
        break;

      case OLDEST_SORT:
        result.sort(
          (a, b) =>
            new Date(a.created_at).getTime() -
            new Date(b.created_at).getTime()
        );
        break;

      case TITLE_ASC_SORT:
        result.sort((a, b) =>
          a.title.localeCompare(b.title, "th")
        );
        break;

      case TITLE_DESC_SORT:
        result.sort((a, b) =>
          b.title.localeCompare(a.title, "th")
        );
        break;
    }

    return result;
  }, [courses, search, status, sort]);

  const totalPages = Math.ceil(
    filteredCourses.length / ITEMS_PER_PAGE
  );

  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  function handleSearchChange(value: string) {
    setSearch(value);
    setCurrentPage(1);
  }

  function handleStatusChange(value: string) {
    setStatus(value);
    setCurrentPage(1);
  }

  function handleSortChange(value: string) {
    setSort(value);
    setCurrentPage(1);
  }

  return (
    <>
      <CourseToolbar
        search={search}
        status={status}
        sort={sort}
        statusOptions={[
          ALL_STATUS,
          PUBLISHED_STATUS,
          DRAFT_STATUS,
        ]}
        sortOptions={[
          NEWEST_SORT,
          OLDEST_SORT,
          TITLE_ASC_SORT,
          TITLE_DESC_SORT,
        ]}
        onSearchChange={handleSearchChange}
        onStatusChange={handleStatusChange}
        onSortChange={handleSortChange}
      />

      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-[#282B28]/75">
          พบ{" "}
          <span className="font-semibold text-[#171B18]">
            {filteredCourses.length}
          </span>{" "}
          คอร์ส
        </p>
      </div>

      {filteredCourses.length === 0 ? (
        <div className="rounded-3xl border border-[#2E7D32]/15 bg-[#FFFDF7] p-10 text-center shadow-sm">
          <div
            className="mb-4 text-4xl"
            aria-hidden="true"
          >
            คอร์ส
          </div>

          <h3 className="text-xl font-bold text-[#171B18]">
            ไม่พบคอร์ส
          </h3>

          <p className="mt-2 text-[#282B28]/75">
            ลองเปลี่ยนคำค้นหา หรือเลือกตัวกรองใหม่
          </p>
        </div>
      ) : (
        <>
          <CourseGrid courses={paginatedCourses} />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </>
  );
}
