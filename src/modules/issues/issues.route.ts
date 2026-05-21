import { Router } from "express";
import { createIssue, getAllIssues } from "./issues.controller";
import auth from "../../middleware/auth";

const router = Router();

router.get("/", getAllIssues);
router.post("/", auth(), createIssue);

export const issuesRouter = router;