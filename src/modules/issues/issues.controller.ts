import type { Request, Response } from "express";
import type { JwtPayload } from "jsonwebtoken";
import sendResponse from "../../utils/sendResponse";
import { issuesService } from "./issues.service";

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

const getIssues = async (req: Request, res: Response) => {
  try {
    const result = await issuesService.getIssuesFromDB(req.params);
    sendResponse((res = res), {
      status: 200,
      success: true,
      //   message: "Issue created successfully",
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
const getSingleIssue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
 
    const result = await issuesService.getSingleIssueFromDB(id as string);
    sendResponse((res = res), {
      status: 200,
      success: true,
      //   message: "Issue created successfully",
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

export const issuesController = { createIssue, getIssues, getSingleIssue };
