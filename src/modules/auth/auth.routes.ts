import { Router } from "express";
import auth from "../../middlewares/auth";
import { USER_ROLE } from "../../types";
import { userController } from "./auth.controller";

const router = Router();

router.post("/signup", userController.signupUser);
router.post("/login", userController.loginUser);
router.get("/", auth(USER_ROLE.contributor), userController.getAllUsers);

export const userRouter = router;
