
export type UserRole = "super_admin" | "client_admin" | "user" | "admin";

export interface UserSettings {
  notifications?: boolean;
  theme?: string;
}

export interface HistoryItemStatus {
  status: "completed" | "failed" | "pending" | "in_progress";
}

export type Language = "en" | "de" | "fr" | "es";
