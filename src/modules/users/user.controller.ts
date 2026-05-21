import type { Request, Response } from "express";
import sendResponse from "../../utils/sendResponse";
import { userService } from "./user.service";

const signupUser = async (req: Request, res: Response) => {
  try {
    const result = await userService.createUserIntoDB(req.body);
    sendResponse((res = res), {
      status: 201,
      success: true,
      message: "User registered successfully",
      data: result,
    });
  
  } catch (error) {
    sendResponse((res = res), {
      status: 201,
      success: true,
      message: "User registration failed",
      error: error,
    });
  }
};

export const userController = { signupUser };
