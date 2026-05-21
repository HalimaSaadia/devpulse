import { pool } from "../../db";
import type { IIssue } from "./issues.interface";

export const createIssuesInBD = async (
  payload: IIssue & { reporter_id: string },
) => {
  const { title, description, status, type, reporter_id } = payload;
  const result = await pool.query(
    `
        INSERT INTO issues (title, description, status, type, reporter_id)
        VALUES ($1, $2, COALESCE($3, 'open'), COALESCE($4, 'bug'), $5)
        RETURNING *
        `,
    [title, description, status, type, reporter_id],
  );

  delete result.rows[0].password;
  return result.rows[0];
};

export const getIssuesFromBD = async (
  sort: string = "newest",
  type: string,
  status: string,
) => {
  const issueResult = await pool.query(
    `
    SELECT * FROM issues
    WHERE
      ($1::varchar IS NULL OR type = $1)
      AND
      ($2::varchar IS NULL OR status = $2)
    ORDER BY
      created_at ${sort === "oldest" ? "ASC" : "DESC"}
    `,
    [type || null, status || null],
  );
  const issues = issueResult.rows;
  const reporterIds = [...new Set(issues.map((i) => i.reporter_id))];

  const usersResult = await pool.query(
    `
    SELECT id, name, role
    FROM users
    WHERE id = ANY($1)
    `,
    [reporterIds],
  );
  const users = usersResult.rows;
  const issuesWithReporter = issues.map((issue) => {
    const reporter = users.find(
      (user) => user.id === Number(issue.reporter_id),
    );

    return {
      ...issue,
      reporter,
    };
  });

  return issuesWithReporter;
};
