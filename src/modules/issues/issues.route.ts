import { Router } from "express";
import { createIssue } from "./issues.controller";
import auth from "../../middleware/auth";

const router = Router();

router.post("/", auth(), createIssue);

export const issuesRouter = router;