import { Router } from "express";
import {
  createIssue,
  deleteIssue,
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
router.delete("/:id", auth(), deleteIssue);
export const issuesRouter = router;
