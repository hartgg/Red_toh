export type HomepageGoalKey =
  | "primary"
  | "secondary"
  | "income";

export interface HomepageGoalCardImage {
  id: string;
  goal: HomepageGoalKey;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}
