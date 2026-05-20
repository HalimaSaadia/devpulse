import { Router } from "express";
import { registerNewUser } from "./auth.controller";

const router = Router()

router.post("/signup", registerNewUser)

export  const authRouter = router