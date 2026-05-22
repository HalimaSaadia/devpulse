import type { Request, Response } from "express";
import { loginUserInBD, registerNewUserInDB } from "./auth.service";
import { sendResponse } from "../../utility/sendResponse";

export const registerNewUser = async (req: Request, res: Response) => {
  try {
    const user = await registerNewUserInDB(req.body);

    sendResponse(res, {
      status: 201,
      success: true,
      message: "User registered successfully",
      data: user,
    });
  } catch (error: any) {
    sendResponse(res, {
      status: 500,
      success: false,
      message: error.message || "Failed to register user",
      errors: error,
    });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await loginUserInBD(email, password);
    sendResponse(res, {
      status: 200,
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error: any) {
    sendResponse(res, {
      status: 401,
      success: false,
      message: error.message || "Invalid credentials",
      errors: error,
    });
  }
};
