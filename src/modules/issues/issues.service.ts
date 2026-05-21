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
    RETURNING * , 
    (
    SELECT json_build_object(
    'id', id,
    'name', name,
    'role', role 
    )
    FROM users
    WHERE users.id = issues.reporter_id
    ) AS reporter
    `,
    [title, description, type, status, reporterId],
  );

  return result.rows[0];
};

const getIssuesFromDB = async (params: any) => {
  const result = await pool.query(`
     SELECT 
      issues.*,
      json_build_object(
        'id', users.id,
        'name', users.name,
        'role', users.role
      ) AS reporter
    FROM issues 
    LEFT JOIN users ON issues.reporter_id = users.id
        
        `);

  return result.rows;
};
const getSingleIssueFromDB = async (id: string) => {
  const result = await pool.query(
    `
  SELECT 
    issues.*,
    (
      SELECT json_build_object(
        'id', users.id,
        'name', users.name,
        'role', users.role
      )
       FROM users
      WHERE users.id = issues.reporter_id
    ) AS reporter
  FROM issues
  WHERE issues.id = $1
  `,
    [id],
  );

  return result.rows[0];
};

export const issuesService = {
  createIssueIntoDB,
  getIssuesFromDB,
  getSingleIssueFromDB,
};
