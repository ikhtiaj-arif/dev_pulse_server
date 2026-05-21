import { Router } from "express";
import { userController } from "./user.controller";

const router = Router();

router.post("/signup", userController.signupUser);

export const userRouter = router;
