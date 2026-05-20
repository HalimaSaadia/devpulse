import express, { type Request, type Response } from "express";
import { authRouter } from "../modules/auth/auth.route";

const app = express();

app.use(express.json());

app.use("/api/auth", authRouter);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

export default app;
