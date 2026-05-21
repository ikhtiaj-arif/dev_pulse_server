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

  return result;
};
const updateIssueDB = async (payload: any, id: string) => {
  //   return { payload, id };
  const {title, status, type, description, userId} = payload

  const issueToUpdate = await pool.query(
    `
    SELECT * FROM issues WHERE id=$1
    
    `,
    [id],
  );

  if (issueToUpdate.rows.length === 0) throw new Error("Issue not found");

  if (issueToUpdate.rows[0].reporter_id !== userId)
    throw new Error("Access denied");

  if (issueToUpdate.rows[0].status !== ISSUE_STATUS.open)
    throw new Error("Issue not open");


  const result = await pool.query(`
    
    UPDATE issues
    SET
    title=COALESCE($1,title),
    description=COALESCE($2,description),
    type=COALESCE($3,type),
    status=COALESCE($4, status)

    WHERE id=$5 RETURNING *


    `,[title, description, type, status, id])



  return result;
};

const deleteIssueFromDB = async(id:string) => {
    const result = await pool.query(`
        DELETE FROM issues WHERE id=$1
        `,[id])

        return result
}



export const issuesService = {
  createIssueIntoDB,
  getIssuesFromDB,
  getSingleIssueFromDB,
  updateIssueDB,deleteIssueFromDB
};
