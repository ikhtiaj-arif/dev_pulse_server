export type ROLES = "maintainer" | "contributor";

export const USER_ROLE = {
  maintainer: "maintainer",
  contributor: "contributor",
} as const;

export const ISSUE_TYPES = {
  bug: "bug",
  feature_request: "feature_request",
} as const;

export const ISSUE_STATUS = {
  open: "open",
  in_progress: "in_progress",
  resolved: "resolved",
} as const;

export type Types = "bug" | "feature_request";
export type Status = "open" | "in_progress" | "resolved";
