import type { Course } from "@/types/course";

export type CareerReviewType = "primary" | "secondary";

export type CareerReviewStatus = "published" | "draft";

export interface CareerReview {
  id: string;
  title: string;
  description: string;
  youtube_url: string;
  income_text: string;
  career_type: CareerReviewType;
  course_id: string;
  status: CareerReviewStatus;
  created_at: string;
  updated_at: string;
}

export interface CareerReviewWithCourse extends CareerReview {
  courses: Course | null;
}
