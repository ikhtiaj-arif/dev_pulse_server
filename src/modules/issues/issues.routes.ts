import { Router } from "express";
import { USER_ROLE } from "../../types";
import auth from "../../middlewares/auth";
import { issuesController } from "./issues.controller";

const router = Router()

router.post('/',auth(USER_ROLE.maintainer, USER_ROLE.contributor), issuesController.createIssue)

export const issuesRouter = router