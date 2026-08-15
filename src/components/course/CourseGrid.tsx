import CourseCard from "./CourseCard";
import type { CourseListItem } from "./CourseFilter";

interface CourseGridProps {
  courses: CourseListItem[];
}

export default function CourseGrid({
  courses,
}: CourseGridProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          course={course}
        />
      ))}
    </div>
  );
}
