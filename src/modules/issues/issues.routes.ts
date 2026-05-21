import { Router } from "express";
import auth from "../../middlewares/auth";
import { USER_ROLE } from "../../types";
import { issuesController } from "./issues.controller";

const router = Router();

router.post(
  "/",
  auth(USER_ROLE.maintainer, USER_ROLE.contributor),
  issuesController.createIssue,
);
router.get("/", issuesController.getIssues);
router.get("/:id", issuesController.getSingleIssue);
router.patch(
  "/:id",
  auth(USER_ROLE.maintainer, USER_ROLE.contributor),
  issuesController.updateIssue,
);
router.delete(
  "/:id",
  auth(USER_ROLE.maintainer),
  issuesController.deleteIssue,
);

export const issuesRouter = router;
