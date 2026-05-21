import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const config = {
  db_connection_string: process.env.DB_CONNECTION_STRING as string,
  port: process.env.PORT,
  salt: process.env.SALT as string,
  jwtSecret: process.env.JWT_SECRET as string
};
export default config;
