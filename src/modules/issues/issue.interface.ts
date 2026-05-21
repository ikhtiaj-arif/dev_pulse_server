import type { Status, Types } from "../../types";

export interface IIssue {
  title: string;
  description: string;
  type: Types;
  status: Status;
  reporter_id: string;
}
