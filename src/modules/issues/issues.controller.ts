import type { Request, Response } from "express";
import sendResponse from "../../utils/sendResponse";
import { issuesService } from "./issues.service";
import type { JwtPayload } from "jsonwebtoken";

const createIssue = async (req: Request, res: Response) => {
  try {
    const { id } = req.user as JwtPayload;
    const result = await issuesService.createIssueIntoDB(req.body, id);
    sendResponse((res = res), {
      status: 201,
      success: true,
      message: "Issue created successfully",
      data: result,
    });
  } catch (error: any) {
    sendResponse((res = res), {
      status: 500,
      success: false,
      message: error.message,
      error: error,
    });
  }
};
export const issuesController = { createIssue };
