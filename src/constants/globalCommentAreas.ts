export const GLOBAL_COMMENT_AREAS = [
  "Name Application",
  "Corporate Structure",
  "Director & Shareholders",
  "Document Upload",
  "Registration Documents",
] as const;

export type GlobalCommentArea = (typeof GLOBAL_COMMENT_AREAS)[number];

export interface GlobalCommentFile {
  name: string;
  path: string;
  uploadedAt?: string;
}

export interface GlobalCommentItem {
  _id: string;
  area: GlobalCommentArea;
  content: string;
  files: GlobalCommentFile[];
  createdByName: string;
  isRead: boolean;
  createdAt: string;
}
