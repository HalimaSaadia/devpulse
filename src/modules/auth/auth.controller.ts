import type { Request, Response } from "express";
import { registerNewUserInDB } from "./auth.service";

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
