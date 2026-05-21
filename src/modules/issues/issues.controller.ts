import type { Request, Response } from "express";
import { createIssuesInBD } from "./issues.service";

export const createIssue = async (req: Request, res: Response) => {
  try {
    const payload = {
      ...req.body,
      reporter_id: req.user.id,
    }
    const issue = await createIssuesInBD(payload);
    
    res.status(201).json({
      success: true,
      message: "Issue created successfully",
      data: issue,
    });
  } catch (error:any) {
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message
    });
  }
};
