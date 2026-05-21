export interface IIssue {
  id: number;
  title: string;
  description: string;
  status: "open" | "in_progress" | "resolved";
  type: "bug" | "feature_request";
  reporter_id: number;
  created_at: Date;
  updated_at: Date;
}