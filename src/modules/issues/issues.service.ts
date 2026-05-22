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

export const getIssueByIdFromDB = async (id: string) => {
  const result = await pool.query("SELECT * FROM issues WHERE id = $1", [id]);
  if (result.rowCount === 0) {
    throw new Error("Issue not found");
  }
  const reporterId = result.rows[0].reporter_id;
  const userData = await pool.query(
    "SELECT id, name, role FROM users WHERE id = $1",
    [Number(reporterId)],
  );
  delete result.rows[0].reporter_id;
  result.rows[0].reporter = userData.rows[0];
  return result.rows[0];
};
export const updateIssueInDB = async (
  id: string,
  payload: Partial<IIssue>,
  userRole: string,
  userId: string,
) => {
  const { title, description, status, type } = payload;

  const existingIssueResult = await pool.query(
    `
    SELECT * FROM issues
    WHERE id = $1
    `,
    [id],
  );

  if (existingIssueResult.rowCount === 0) {
    throw new Error("Issue not found");
  }
  const existingIssue = existingIssueResult.rows[0];
  const isMaintainer = userRole === "maintainer";
  const isContributorOwner =
    userRole === "contributor" &&
    existingIssue.reporter_id == userId &&
    existingIssue.status === "open";

  if (!isMaintainer && !isContributorOwner) {
    throw new Error("You are not authorized to update this issue");
  }

  const result = await pool.query(
    `
        UPDATE issues
        SET title = COALESCE($1, title),
            description = COALESCE($2, description),
            status = COALESCE($3, status),
            type = COALESCE($4, type)
        WHERE id = $5
        RETURNING *
      `,
    [title, description, status, type, id],
  );
  if (result.rowCount === 0) {
    throw new Error("Issue not found");
  }

  return result.rows[0];
};

export const deleteIssueFromDB = async (id: string, role: string) => {
  if (role !== "maintainer") {
    throw new Error("Forbidden Access");
  }
  const existingIssueResult = await pool.query(
    `
    SELECT * FROM issues
    WHERE id = $1
    `,
    [id],
  );
  if (existingIssueResult.rowCount === 0) {
    throw new Error("Issue not found");
  }
  const result = pool.query(
    `
  DELETE FROM issues
  WHERE id = $1
  `,
    [id],
  );
  return result;
};
