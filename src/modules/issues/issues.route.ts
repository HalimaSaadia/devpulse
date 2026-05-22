import { Router } from "express";
import {
  createIssue,
  getAllIssues,
  getIssueById,
  updateIssue,
} from "./issues.controller";
import auth from "../../middleware/auth";

const router = Router();

router.get("/", getAllIssues);
router.post("/", auth(), createIssue);
router.get("/:id", getIssueById);
router.patch("/:id", auth(), updateIssue);
export const issuesRouter = router;
