import type { Request, Response } from "express";
import {
  createIssuesInBD,
  deleteIssueFromDB,
  getIssueByIdFromDB,
  getIssuesFromBD,
  updateIssueInDB,
} from "./issues.service";
import { sendResponse } from "../../utility/sendResponse";

export const createIssue = async (req: Request, res: Response) => {
  try {
    const payload = {
      ...req.body,
      reporter_id: req.user.id,
    };
    const issue = await createIssuesInBD(payload);

    sendResponse(res, {
      status: 201,
      success: true,
      message: "Issue created successfully",
      data: issue,
    });
  } catch (error: any) {
    sendResponse(res, {
      status: 500,
      success: false,
      message: error.message,
      errors: error,
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

    sendResponse(res, {
      status: 200,
      success: true,
      message: "Issues retrieved successfully",
      data: issues,
    });
  } catch (error: any) {
    sendResponse(res, {
      status: 500,
      success: false,
      message: error.message,
      errors: error,
    });
  }
};

export const getIssueById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const issues = await getIssueByIdFromDB(id as string);

    sendResponse(res, {
      status: 200,
      success: true,
      message: "Issue retrieved successfully",
      data: issues,
    });
  } catch (error: any) {
    sendResponse(res, {
      status: 500,
      success: false,
      message: error.message,
      errors: error,
    });
  }
};

export const updateIssue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    const { role: userRole, id: userId } = req.user;

    const updatedIssue = await updateIssueInDB(
      id as string,
      payload,
      userRole,
      userId,
    );

    sendResponse(res, {
      status: 200,
      success: true,
      message: "Issue updated successfully",
      data: updatedIssue,
    });
  } catch (error: any) {
    sendResponse(res, {
      status: 500,
      success: false,
      message: error.message,
      errors: error,
    });
  }
};

export const deleteIssue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.user;
    const result = await deleteIssueFromDB(id as string, role);
    sendResponse(res, {
      status: 200,
      success: true,
      message: "Issue deleted successfully",
    });
  } catch (error: any) {
    sendResponse(res, {
      status: 500,
      success: false,
      message: error.message,
    });
  }
};
