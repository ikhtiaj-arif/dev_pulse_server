import bcrypt, { hash } from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../../_db";
import config from "../../config";
import type { IUser } from "./auth.interface";

const createUserIntoDB = async (payload: IUser) => {
  const { name, email, password, role } = payload;

  const hashPassword = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `
    INSERT INTO users(name, email, password, role) VALUES($1,$2,$3,COALESCE($4, 'contributor'))
    RETURNING *
    `,
    [name, email, hashPassword, role],
  );
  delete result.rows[0].password;
  return result.rows[0];
};

const loginUserDB = async (payload: { email: string; password: string }) => {
  const { email, password } = payload;

  //? Check user is on the db or not, if not throw error
  //? compare the decrypted password after encoding
  //? if password not match throw error, if match generate token with: id, name, email, role
  //? return token with success response

  const existingUserData = await pool.query(
    `
    SELECT * FROM users WHERE email=$1
    `,
    [email],
  );

  if (existingUserData.rows.length === 0)
    throw new Error("Invalid credentials");

  const existingUser = existingUserData.rows[0];

  const passwordMatch = await bcrypt.compare(password, existingUser.password);

  if (!passwordMatch) throw new Error("Invalid credentials");

  const jwtPayload = {
    id: existingUser.id,
    name: existingUser.name,
    email: existingUser.email,
    role: existingUser.role,
  };

  const accessToken = jwt.sign(jwtPayload, config.jwtSecret, {
    expiresIn: "2d",
  });

  const { password: _, ...userWithoutPassword } = existingUser;

  return {
    token: accessToken,
    user: userWithoutPassword,
  };
};

const getUsersFromDB = async () => {
  const result = await pool.query(`
     SELECT * FROM users
    `);
  delete result.rows[0].password;
  return result.rows;
};

export const userService = { createUserIntoDB, loginUserDB, getUsersFromDB };
