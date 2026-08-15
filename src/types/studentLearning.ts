export interface CourseEnrollment {
  id: string;
  course_id: string;
  user_id: string;
  created_at: string;
}

export interface LessonProgress {
  id: string;
  course_id: string;
  lesson_id: string;
  user_id: string;
  completed_at: string;
}
