import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { config } from "../config/config";
import { pool } from "../db";
import type { Role } from "../types";

const auth = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const decoded = jwt.verify(
      authHeader as string,
      config.JWT_SECRET as string,
    ) as JwtPayload;

    const userData = await pool.query(
      `
        SELECT * FROM users WHERE id = $1
    `,
      [decoded.id],
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

export default auth;
