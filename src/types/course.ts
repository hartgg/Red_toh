export interface Course {
  id: string;
  user_id: string;
  title: string;
  description: string;
  image_url: string | null;
  status: "published" | "draft";
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description: string;
  youtube_url: string | null;
  lesson_order: number;
  created_at: string;
  updated_at: string;
}

export interface CourseWithLessons extends Course {
  lessons: Lesson[];
}