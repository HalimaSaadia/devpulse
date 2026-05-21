import type { Request, Response } from "express";
import { loginUserInBD, registerNewUserInDB } from "./auth.service";

export const registerNewUser = async (req: Request, res: Response) => {
  try {
    const user = await registerNewUserInDB(req.body);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user,
    });
  } catch (error) {
    console.error("Error registering new user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await loginUserInBD(email, password);
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
   
    res.status(401).json({ error: "Invalid credentials" });
  }
};
