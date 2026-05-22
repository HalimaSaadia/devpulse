import type { Request, Response } from "express";
import {
  createIssuesInBD,
  getIssueByIdFromDB,
  getIssuesFromBD,
  updateIssueInDB,
} from "./issues.service";

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
    const issues = await getIssuesFromBD(
      sort as string,
      type as string,
      status as string,
    );

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

export const getIssueById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const issues = await getIssueByIdFromDB(id as string);

    res.status(200).json({
      success: true,
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

export const updateIssue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    const { role: userRole , id: userId} = req.user;
    
    const updatedIssue = await updateIssueInDB(id as string, payload, userRole, userId );

    res.status(200).json({
      success: true,
      message: "Issue updated successfully",
      data: updatedIssue,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: "Failed to update issue",
      message: error.message,
    });
  }
}
