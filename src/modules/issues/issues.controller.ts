import type { Request, Response } from "express";
import { createIssuesInBD, getIssuesFromBD } from "./issues.service";

export const createIssue = async (req: Request, res: Response) => {
  try {
    const payload = {
      ...req.body,
      reporter_id: req.user.id,
    };
    const issue = await createIssuesInBD(payload);

    res.status(201).json({
      success: true,
      message: "Issue created successfully",
      data: issue,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
};
export const getAllIssues = async (req: Request, res: Response) => {
  try {
    const { sort, type, status } = req.query;
    const issues = await getIssuesFromBD(sort, type, status);

    res.status(200).json({
      success: true,
      message: "Issues retrieved successfully",
      data: issues,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: "Failed to retrieve issues",
      message: error.message,
    });
  }
};
