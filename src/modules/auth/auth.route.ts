import { Router } from "express";
import { loginUser, registerNewUser } from "./auth.controller";

const router = Router();

router.post("/signup", registerNewUser);
router.post("/login", loginUser);

export const authRouter = router;
