

   import { createRequire } from 'module';

   const require = createRequire(import.meta.url);

  

// src/app/app.ts
import express from "express";

// src/modules/auth/auth.route.ts
import { Router } from "express";

// src/db/index.ts
import { Pool } from "pg";

// src/config/config.ts
import dotenv from "dotenv";
import { cwd } from "process";
import path from "path";
dotenv.config({
  path: path.join(cwd(), ".env")
});
var config = {
  PORT: process.env.PORT,
  CONNECTION_STRING: process.env.CONNECTION_STRING,
  JWT_SECRET: process.env.jwt_secret
};

// src/db/index.ts
var pool = new Pool({
  connectionString: config.CONNECTION_STRING
});
var initDB = async () => {
  try {
    pool.query(`
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'contributor',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
    )`);
    pool.query(`
    CREATE TABLE IF NOT EXISTS issues (
        id SERIAL PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        description TEXT CHECK (LENGTH(description) >= 50) NOT NULL,
        type VARCHAR(255) CHECK (type IN ('bug', 'feature_request')),
        status VARCHAR(255)  CHECK (status IN ('open', 'in_progress', 'resolved')) DEFAULT 'open',
        reporter_id INTEGER  NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
    )`);
    console.log("Successfully created collection");
  } catch (err) {
    console.error("Error creating users table:", err);
  }
};

// src/modules/auth/auth.service.ts
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
var registerNewUserInDB = async (payload) => {
  const { name, email, password, role } = payload;
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `
        INSERT INTO users (name, email, password,  role)

        VALUES ($1, $2, $3, COALESCE($4, 'contributor'))
        RETURNING *
        `,
    [name, email, hashedPassword, role]
  );
  delete result.rows[0].password;
  return result.rows[0];
};
var loginUserInBD = async (email, password) => {
  const userData = await pool.query(
    `
        SELECT * FROM users WHERE email = $1
        `,
    [email]
  );
  if (userData.rows.length === 0) {
    throw new Error("User not found");
  }
  const user = userData.rows[0];
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }
  delete user.password;
  const jwtPayload = {
    id: user.id,
    name: user.name,
    role: user.role
  };
  const token = jwt.sign(jwtPayload, config.JWT_SECRET, { expiresIn: "1d" });
  return { user, token };
};

// src/utility/sendResponse.ts
var sendResponse = (res, data) => {
  res.status(data.status).json({
    success: data.success,
    message: data.message,
    data: data.data,
    errors: data.errors
  });
};

// src/modules/auth/auth.controller.ts
var registerNewUser = async (req, res) => {
  try {
    const user = await registerNewUserInDB(req.body);
    sendResponse(res, {
      status: 201,
      success: true,
      message: "User registered successfully",
      data: user
    });
  } catch (error) {
    sendResponse(res, {
      status: 500,
      success: false,
      message: error.message || "Failed to register user",
      errors: error
    });
  }
};
var loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await loginUserInBD(email, password);
    sendResponse(res, {
      status: 200,
      success: true,
      message: "Login successful",
      data: result
    });
  } catch (error) {
    sendResponse(res, {
      status: 401,
      success: false,
      message: error.message || "Invalid credentials",
      errors: error
    });
  }
};

// src/modules/auth/auth.route.ts
var router = Router();
router.post("/signup", registerNewUser);
router.post("/login", loginUser);
var authRouter = router;

// src/modules/issues/issues.route.ts
import { Router as Router2 } from "express";

// src/modules/issues/issues.service.ts
var createIssuesInBD = async (payload) => {
  const { title, description, status, type, reporter_id } = payload;
  const result = await pool.query(
    `
        INSERT INTO issues (title, description, status, type, reporter_id)
        VALUES ($1, $2, COALESCE($3, 'open'), COALESCE($4, 'bug'), $5)
        RETURNING *
        `,
    [title, description, status, type, reporter_id]
  );
  delete result.rows[0].password;
  return result.rows[0];
};
var getIssuesFromBD = async (sort = "newest", type, status) => {
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
    [type || null, status || null]
  );
  const issues = issueResult.rows;
  if (issueResult.rowCount == 0) {
    throw new Error("No issues found");
  }
  const reporterIds = [...new Set(issues.map((i) => i.reporter_id))];
  const usersResult = await pool.query(
    `
    SELECT id, name, role
    FROM users
    WHERE id = ANY($1)
    `,
    [reporterIds]
  );
  const users = usersResult.rows;
  const issuesWithReporter = issues.map((issue) => {
    const reporter = users.find(
      (user) => user.id === Number(issue.reporter_id)
    );
    return {
      ...issue,
      reporter
    };
  });
  return issuesWithReporter;
};
var getIssueByIdFromDB = async (id) => {
  const result = await pool.query("SELECT * FROM issues WHERE id = $1", [id]);
  if (result.rowCount === 0) {
    throw new Error("Issue not found");
  }
  const reporterId = result.rows[0].reporter_id;
  const userData = await pool.query(
    "SELECT id, name, role FROM users WHERE id = $1",
    [Number(reporterId)]
  );
  delete result.rows[0].reporter_id;
  result.rows[0].reporter = userData.rows[0];
  return result.rows[0];
};
var updateIssueInDB = async (id, payload, userRole, userId) => {
  const { title, description, status, type } = payload;
  const existingIssueResult = await pool.query(
    `
    SELECT * FROM issues
    WHERE id = $1
    `,
    [id]
  );
  if (existingIssueResult.rowCount === 0) {
    throw new Error("Issue not found");
  }
  const existingIssue = existingIssueResult.rows[0];
  const isMaintainer = userRole === "maintainer";
  const isContributorOwner = userRole === "contributor" && existingIssue.reporter_id == userId && existingIssue.status === "open";
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
    [title, description, status, type, id]
  );
  if (result.rowCount === 0) {
    throw new Error("Issue not found");
  }
  return result.rows[0];
};
var deleteIssueFromDB = async (id, role) => {
  if (role !== "maintainer") {
    throw new Error("Forbidden Access");
  }
  const existingIssueResult = await pool.query(
    `
    SELECT * FROM issues
    WHERE id = $1
    `,
    [id]
  );
  if (existingIssueResult.rowCount === 0) {
    throw new Error("Issue not found");
  }
  const result = pool.query(
    `
  DELETE FROM issues
  WHERE id = $1
  `,
    [id]
  );
  return result;
};

// src/modules/issues/issues.controller.ts
var createIssue = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      reporter_id: req.user.id
    };
    const issue = await createIssuesInBD(payload);
    sendResponse(res, {
      status: 201,
      success: true,
      message: "Issue created successfully",
      data: issue
    });
  } catch (error) {
    sendResponse(res, {
      status: 500,
      success: false,
      message: error.message,
      errors: error
    });
  }
};
var getAllIssues = async (req, res) => {
  try {
    const { sort, type, status } = req.query;
    const issues = await getIssuesFromBD(
      sort,
      type,
      status
    );
    sendResponse(res, {
      status: 200,
      success: true,
      message: "Issues retrieved successfully",
      data: issues
    });
  } catch (error) {
    sendResponse(res, {
      status: 500,
      success: false,
      message: error.message,
      errors: error
    });
  }
};
var getIssueById = async (req, res) => {
  try {
    const { id } = req.params;
    const issues = await getIssueByIdFromDB(id);
    sendResponse(res, {
      status: 200,
      success: true,
      message: "Issue retrieved successfully",
      data: issues
    });
  } catch (error) {
    sendResponse(res, {
      status: 500,
      success: false,
      message: error.message,
      errors: error
    });
  }
};
var updateIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    const { role: userRole, id: userId } = req.user;
    const updatedIssue = await updateIssueInDB(
      id,
      payload,
      userRole,
      userId
    );
    sendResponse(res, {
      status: 200,
      success: true,
      message: "Issue updated successfully",
      data: updatedIssue
    });
  } catch (error) {
    sendResponse(res, {
      status: 500,
      success: false,
      message: error.message,
      errors: error
    });
  }
};
var deleteIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.user;
    const result = await deleteIssueFromDB(id, role);
    sendResponse(res, {
      status: 200,
      success: true,
      message: "Issue deleted successfully"
    });
  } catch (error) {
    sendResponse(res, {
      status: 500,
      success: false,
      message: error.message
    });
  }
};

// src/middleware/auth.ts
import jwt2 from "jsonwebtoken";
var auth = () => {
  return async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const decoded = jwt2.verify(
      authHeader,
      config.JWT_SECRET
    );
    const userData = await pool.query(
      `
        SELECT * FROM users WHERE id = $1
    `,
      [decoded.id]
    );
    if (userData.rowCount === 0) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const user = userData.rows[0];
    if (user.role !== "contributor" && user.role !== "maintainer") {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    delete user.password;
    req.user = user;
    next();
  };
};
var auth_default = auth;

// src/modules/issues/issues.route.ts
var router2 = Router2();
router2.get("/", getAllIssues);
router2.post("/", auth_default(), createIssue);
router2.get("/:id", getIssueById);
router2.patch("/:id", auth_default(), updateIssue);
router2.delete("/:id", auth_default(), deleteIssue);
var issuesRouter = router2;

// src/app/app.ts
var app = express();
app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api/issues", issuesRouter);
app.get("/", (req, res) => {
  res.json({
    message: "server is running"
  });
});
var app_default = app;

// src/server.ts
var main = () => {
  initDB();
  app_default.listen(config.PORT, () => {
    console.log(`Example app listening on port ${config.PORT}`);
  });
};
main();
//# sourceMappingURL=server.js.map