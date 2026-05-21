import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import config from "./config";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import { userRouter } from "./modules/auth/auth.routes";

const app: Application = express();
const port = config.port;
const db_connection_string = config.db_connection_string;

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded());

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Express Server running!",
    author: "ikhtiaj_arif",
    port: port,
  });
});

app.use("/api/auth", userRouter);

//error handler
app.use(globalErrorHandler);

export default app;
