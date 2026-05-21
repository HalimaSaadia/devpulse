import { pool } from "../../db";
import bcrypt from "bcrypt";
import type { IUser } from "./user.interface";
import jwt from "jsonwebtoken";
import { config } from "../../config/config";

export const registerNewUserInDB = async (payload: IUser) => {
  const { name, email, password, role } = payload;
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `
        INSERT INTO users (name, email, password,  role)

        VALUES ($1, $2, $3, COALESCE($4, 'contributor'))
        RETURNING *
        `,
    [name, email, hashedPassword, role],
  );

  delete result.rows[0].password;
  return result.rows[0];
};

export const loginUserInBD = async (email: string, password: string) => {
  const userData = await pool.query(
    `
        SELECT * FROM users WHERE email = $1
        `,
    [email],
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
    role: user.role,
  };
  const token = jwt.sign(jwtPayload, config.JWT_SECRET, { expiresIn: "1d" });
  return { user, token };
};
