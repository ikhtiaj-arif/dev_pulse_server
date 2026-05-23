import { pool } from "../../_db";
import { ISSUE_STATUS } from "../../types";
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

  return result;
};

const getIssuesFromDB = async (query: Record<string, unknown>) => {

  //? 1. Extract query parameters
  const { sort = "newest", type, status } = query;

  // dynamically build WHERE conditions here
  const conditions: string[] = [];

  // Values array for parameterized queries ($1, $2, ...)
  const values: unknown[] = [];

  //? 2. Build FILTER conditions
  // Filter by issue type (bug / feature_request)
  if (type) {
    values.push(type); // push value first
    conditions.push(`issues.type = $${values.length}`); // assign correct placeholder index
  }

  // Filter by issue status (open / in_progress / resolved)
  if (status) {
    values.push(status);
    conditions.push(`issues.status = $${values.length}`);
  }


  //? 3. Build WHERE clause safely
  // If no filters are applied, WHERE clause is empty
  // Otherwise combine all conditions using AND
  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";


  //? 4. Sorting logic 
  // Default: newest first (DESC)
  // If sort = oldest → ASC order
  const orderBy =
    sort === "oldest"
      ? `ORDER BY issues.created_at ASC`
      : `ORDER BY issues.created_at DESC`;


  //? 5. Main Query
  // correlated subquery to fetch reporter info
  // Instead of JOIN, we fetch user per issue row
  const queryText = `
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
    ${whereClause}
    ${orderBy}
  `;

  //? 6. Execute query
  // values[] automatically maps to $1, $2, ...
  const result = await pool.query(queryText, values);

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

  return result;
};
const updateIssueDB = async (payload: any, id: string) => {
  //   return { payload, id };
  const { title, status, type, description, user } = payload;

  const issueToUpdate = await pool.query(
    `
    SELECT * FROM issues WHERE id=$1
    
    `,
    [id],
  );

  if (issueToUpdate.rows.length === 0) throw new Error("Issue not found");
  const issue = issueToUpdate.rows[0]

 //! If maintainer update all issue, else own issue only when status === open

    if (user.role !== "maintainer") {
    // If the user is just a contributor, enforce these strict rules:
    if (issue.reporter_id !== user.id) {
        throw new Error("Access denied");
    }
    if (issue.status !== ISSUE_STATUS.open) {
        throw new Error("Issue not open");
    }
  }

  const result = await pool.query(
    `
    
    UPDATE issues
    SET
    title=COALESCE($1,title),
    description=COALESCE($2,description),
    type=COALESCE($3,type),
    status=COALESCE($4, status),
    updated_at = NOW()

    WHERE id=$5 RETURNING *


    `,
    [title, description, type, status, id],
  );

  return result;
};

const deleteIssueFromDB = async (id: string) => {
  const result = await pool.query(
    `
        DELETE FROM issues WHERE id=$1
        `,
    [id],
  );

  return result;
};

export const issuesService = {
  createIssueIntoDB,
  getIssuesFromDB,
  getSingleIssueFromDB,
  updateIssueDB,
  deleteIssueFromDB,
};
