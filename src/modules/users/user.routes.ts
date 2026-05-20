import { Router, type Request, type Response } from "express";

const userRouter = Router();

userRouter.post("/signup", (req: Request, res: Response) => {
  res.send("jo")
});

export default userRouter;
