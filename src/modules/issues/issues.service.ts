import { pool } from "../../db";
import type { IIssue } from "./issues.interface";

export const createIssuesInBD = async (payload: IIssue & { reporter_id: string }, ) => {
  const { title, description, status, type, reporter_id } = payload;
  const result = await pool.query(
    `
        INSERT INTO issues (title, description, status, type, reporter_id)
        VALUES ($1, $2, COALESCE($3, 'open'), COALESCE($4, 'bug'), $5)
        RETURNING *
        `,
    [title, description, status, type, reporter_id],
  );

  delete result.rows[0].password
  return result.rows[0];
};