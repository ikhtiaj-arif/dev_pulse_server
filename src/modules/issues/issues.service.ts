import { pool } from "../../_db";
import type { IIssue } from "./issue.interface";

const createIssueIntoDB = async (payload: IIssue, reporterId: string) => {
  const { title, description, type, status } = payload;

  const userExists = await pool.query(
    `
    SELECT * FROM users WHERE id=$1  
    `,
    [reporterId],
  );

  if (userExists.rows.length === 0) throw new Error("User not found");

  const result = await pool.query(
    `
    INSERT INTO issues(title, description, type, status, reporter_id) VALUES($1,$2,$3,COALESCE($4, 'open'),$5)
    RETURNING *
    `,
    [title, description, type, status, reporterId],
  );

  return result.rows[0];
};

export const issuesService = { createIssueIntoDB };
