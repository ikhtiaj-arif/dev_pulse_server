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

  console.log(req.query);

  try {
    const result = await issuesService.getIssuesFromDB( req.query);
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

    if (result.rows.length === 0) {
     return sendResponse((res = res), {
        status: 404,
        success: false,
        message: "Issue not found",
        //   data: result,
      });
    }

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
const updateIssue = async (req: Request, res: Response) => {
  try {
    const { id: issueId } = req.params;
    const { id: userId } = req.user as JwtPayload;
    const payload = { user: req.user, ...req.body };

    const result = await issuesService.updateIssueDB(
      payload,
      issueId as string,
    );
    sendResponse((res = res), {
      status: 200,
      success: true,
      //   message: "Issue created successfully",
      data: result.rows[0],
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
const deleteIssue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await issuesService.deleteIssueFromDB(id as string);
    if (result.rowCount === 0) {
      return sendResponse((res = res), {
        status: 404,
        success: false,
        message: "Issue not found",
        //   data: result,
      });
    }
    sendResponse((res = res), {
      status: 200,
      success: true,
      message: "Issue deleted successfully",
      //   data: result,
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

export const issuesController = {
  createIssue,
  getIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue,
};
