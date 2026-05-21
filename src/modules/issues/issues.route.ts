import { Router } from "express";
import { createIssue, getAllIssues, getIssueById } from "./issues.controller";
import auth from "../../middleware/auth";

const router = Router();

router.get("/", getAllIssues);
router.post("/", auth(), createIssue);
router.get("/:id", getIssueById);

export const issuesRouter = router;