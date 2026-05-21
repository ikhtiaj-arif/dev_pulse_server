import type { Request, Response } from "express";
import sendResponse from "../../utils/sendResponse";
import { userService } from "./auth.service";

const signupUser = async (req: Request, res: Response) => {
  try {
    const result = await userService.createUserIntoDB(req.body);
    sendResponse((res = res), {
      status: 201,
      success: true,
      message: "User registered successfully",
      data: result,
    });
  } catch (error: any) {
    sendResponse((res = res), {
      status: 500,
      success: false,
      message: "User registration failed",
      error: error,
    });
  }
};
const loginUser = async (req: Request, res: Response) => {
  try {
    const result = await userService.loginUserDB(req.body);
    sendResponse((res = res), {
      status: 200,
      success: true,
      message: "Login successful",
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
const getAllUsers = async (req: Request, res: Response) => {
  try {
    const result = await userService.getUsersFromDB();
    sendResponse((res = res), {
      status: 200,
      success: true,
      message: "Users retrieved successfully",
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

export const userController = { signupUser, loginUser, getAllUsers };
