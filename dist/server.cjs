

   import { createRequire } from 'module';

   const require = createRequire(import.meta.url);

  
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/_db/index.ts
var import_pg = require("pg");

// src/config/index.ts
var import_dotenv = __toESM(require("dotenv"), 1);
var import_path = __toESM(require("path"), 1);
import_dotenv.default.config({ path: import_path.default.join(process.cwd(), ".env") });
var config = {
  db_connection_string: process.env.DB_CONNECTION_STRING,
  port: process.env.PORT,
  jwtSecret: process.env.JWT_SECRET
};
var config_default = config;

// src/_db/index.ts
var pool = new import_pg.Pool({
  connectionString: config_default.db_connection_string
});
var initDB = async () => {
  try {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users(
        id SERIAL PRIMARY KEY,
        name VARCHAR(20),
        email VARCHAR(20) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role VARCHAR(20) DEFAULT 'contributor',

        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
        )
            `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS issues(
      id SERIAL PRIMARY KEY,
      title VARCHAR(150),
      description TEXT,
      type VARCHAR(20) DEFAULT 'bug',
      status VARCHAR(20) DEFAULT 'open',

      reporter_id INT REFERENCES users(id) ON DELETE CASCADE,

      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
      )  
        `);
    console.log("Database connected!");
  } catch (error) {
    console.log("Database failed connecting!");
    console.log(error);
  }
};

// src/app.ts
var import_express3 = __toESM(require("express"), 1);

// src/middlewares/globalErrorHandler.ts
var globalErrorHandler = (err, req, res, next) => {
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
};
var globalErrorHandler_default = globalErrorHandler;

// src/modules/auth/auth.routes.ts
var import_express = require("express");

// src/middlewares/auth.ts
var import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);

// src/utils/sendResponse.ts
var sendResponse = (res, data) => {
  res.status(data.status).json({
    success: data.success,
    message: data.message,
    data: data.data,
    error: data.error
  });
};
var sendResponse_default = sendResponse;

// src/middlewares/auth.ts
var auth = (...roles) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        return sendResponse_default(res, {
          status: 401,
          success: false,
          message: "Unauthorized access"
        });
      }
      const decoded = import_jsonwebtoken.default.verify(
        token,
        config_default.jwtSecret
      );
      const userData = await pool.query(
        `
        SELECT * FROM users WHERE email=$1    
        
        `,
        [decoded.email]
      );
      if (userData.rows.length === 0) {
        return sendResponse_default(res, {
          status: 404,
          success: false,
          message: "User not found"
        });
      }
      const user = userData.rows[0];
      if (roles.length && !roles.includes(user.role)) {
        return sendResponse_default(res, {
          status: 403,
          success: false,
          message: "Forbidden"
        });
      }
      req.user = decoded;
      next();
    } catch (error) {
      console.log("auth error");
      console.log(error);
      next(error);
    }
  };
};
var auth_default = auth;

// src/types/index.ts
var USER_ROLE = {
  maintainer: "maintainer",
  contributor: "contributor"
};
var ISSUE_STATUS = {
  open: "open",
  in_progress: "in_progress",
  resolved: "resolved"
};

// src/modules/auth/auth.service.ts
var import_bcrypt = __toESM(require("bcrypt"), 1);
var import_jsonwebtoken2 = __toESM(require("jsonwebtoken"), 1);
var createUserIntoDB = async (payload) => {
  const { name, email, password, role } = payload;
  const hashPassword = await import_bcrypt.default.hash(password, 10);
  const result = await pool.query(
    `
    INSERT INTO users(name, email, password, role) VALUES($1,$2,$3,COALESCE($4, 'contributor'))
    RETURNING *
    `,
    [name, email, hashPassword, role]
  );
  delete result.rows[0].password;
  return result.rows[0];
};
var loginUserDB = async (payload) => {
  const { email, password } = payload;
  const existingUserData = await pool.query(
    `
    SELECT * FROM users WHERE email=$1
    `,
    [email]
  );
  if (existingUserData.rows.length === 0)
    throw new Error("Invalid credentials");
  const existingUser = existingUserData.rows[0];
  const passwordMatch = await import_bcrypt.default.compare(password, existingUser.password);
  if (!passwordMatch) throw new Error("Invalid credentials");
  const jwtPayload = {
    id: existingUser.id,
    name: existingUser.name,
    email: existingUser.email,
    role: existingUser.role
  };
  const accessToken = import_jsonwebtoken2.default.sign(jwtPayload, config_default.jwtSecret, {
    expiresIn: "2d"
  });
  const { password: _, ...userWithoutPassword } = existingUser;
  return {
    token: accessToken,
    user: userWithoutPassword
  };
};
var getUsersFromDB = async () => {
  const result = await pool.query(`
     SELECT * FROM users
    `);
  delete result.rows[0].password;
  return result.rows;
};
var userService = { createUserIntoDB, loginUserDB, getUsersFromDB };

// src/modules/auth/auth.controller.ts
var signupUser = async (req, res) => {
  try {
    const result = await userService.createUserIntoDB(req.body);
    sendResponse_default(res = res, {
      status: 201,
      success: true,
      message: "User registered successfully",
      data: result
    });
  } catch (error) {
    sendResponse_default(res = res, {
      status: 500,
      success: false,
      message: "User registration failed",
      error
    });
  }
};
var loginUser = async (req, res) => {
  try {
    const result = await userService.loginUserDB(req.body);
    sendResponse_default(res = res, {
      status: 200,
      success: true,
      message: "Login successful",
      data: result
    });
  } catch (error) {
    sendResponse_default(res = res, {
      status: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var getAllUsers = async (req, res) => {
  try {
    const result = await userService.getUsersFromDB();
    sendResponse_default(res = res, {
      status: 200,
      success: true,
      message: "Users retrieved successfully",
      data: result
    });
  } catch (error) {
    sendResponse_default(res = res, {
      status: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var userController = { signupUser, loginUser, getAllUsers };

// src/modules/auth/auth.routes.ts
var router = (0, import_express.Router)();
router.post("/signup", userController.signupUser);
router.post("/login", userController.loginUser);
router.get("/", auth_default(USER_ROLE.contributor), userController.getAllUsers);
var userRouter = router;

// src/modules/issues/issues.routes.ts
var import_express2 = require("express");

// src/modules/issues/issues.service.ts
var createIssueIntoDB = async (payload, reporterId) => {
  const { title, description, type, status } = payload;
  const userExists = await pool.query(
    `
    SELECT * FROM users WHERE id=$1  
    `,
    [reporterId]
  );
  if (userExists.rows.length === 0) throw new Error("User not found");
  const result = await pool.query(
    `
    INSERT INTO issues(title, description, type, status, reporter_id) VALUES($1,$2,$3,COALESCE($4, 'open'),$5)
    RETURNING * , 
    (
    SELECT json_build_object(
    'id', id,
    'name', name,
    'role', role 
    )
    FROM users
    WHERE users.id = issues.reporter_id
    ) AS reporter
    `,
    [title, description, type, status, reporterId]
  );
  return result;
};
var getIssuesFromDB = async (query) => {
  const { sort = "newest", type, status } = query;
  const conditions = [];
  const values = [];
  if (type) {
    values.push(type);
    conditions.push(`issues.type = $${values.length}`);
  }
  if (status) {
    values.push(status);
    conditions.push(`issues.status = $${values.length}`);
  }
  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const orderBy = sort === "oldest" ? `ORDER BY issues.created_at ASC` : `ORDER BY issues.created_at DESC`;
  const queryText = `
    SELECT 
      issues.*,

      (
        SELECT json_build_object(
          'id', users.id,
          'name', users.name,
          'role', users.role
        )
        FROM users
        WHERE users.id = issues.reporter_id
      ) AS reporter

    FROM issues
    ${whereClause}
    ${orderBy}
  `;
  const result = await pool.query(queryText, values);
  return result.rows;
};
var getSingleIssueFromDB = async (id) => {
  const result = await pool.query(
    `
  SELECT 
    issues.*,
    (
      SELECT json_build_object(
        'id', users.id,
        'name', users.name,
        'role', users.role
      )
       FROM users
      WHERE users.id = issues.reporter_id
    ) AS reporter
  FROM issues
  WHERE issues.id = $1
  `,
    [id]
  );
  return result;
};
var updateIssueDB = async (payload, id) => {
  const { title, status, type, description, user } = payload;
  const issueToUpdate = await pool.query(
    `
    SELECT * FROM issues WHERE id=$1
    
    `,
    [id]
  );
  if (issueToUpdate.rows.length === 0) throw new Error("Issue not found");
  const issue = issueToUpdate.rows[0];
  if (user.role !== "maintainer") {
    if (issue.reporter_id !== user.id) {
      throw new Error("Access denied");
    }
    if (issue.status !== ISSUE_STATUS.open) {
      throw new Error("Issue not open");
    }
  }
  const result = await pool.query(
    `
    
    UPDATE issues
    SET
    title=COALESCE($1,title),
    description=COALESCE($2,description),
    type=COALESCE($3,type),
    status=COALESCE($4, status),
    updated_at = NOW()

    WHERE id=$5 RETURNING *


    `,
    [title, description, type, status, id]
  );
  return result;
};
var deleteIssueFromDB = async (id) => {
  const result = await pool.query(
    `
        DELETE FROM issues WHERE id=$1
        `,
    [id]
  );
  return result;
};
var issuesService = {
  createIssueIntoDB,
  getIssuesFromDB,
  getSingleIssueFromDB,
  updateIssueDB,
  deleteIssueFromDB
};

// src/modules/issues/issues.controller.ts
var createIssue = async (req, res) => {
  try {
    const { id } = req.user;
    const result = await issuesService.createIssueIntoDB(req.body, id);
    sendResponse_default(res = res, {
      status: 201,
      success: true,
      message: "Issue created successfully",
      data: result
    });
  } catch (error) {
    sendResponse_default(res = res, {
      status: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var getIssues = async (req, res) => {
  console.log(req.query);
  try {
    const result = await issuesService.getIssuesFromDB(req.query);
    sendResponse_default(res = res, {
      status: 200,
      success: true,
      //   message: "Issue created successfully",
      data: result
    });
  } catch (error) {
    sendResponse_default(res = res, {
      status: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var getSingleIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await issuesService.getSingleIssueFromDB(id);
    if (result.rows.length === 0) {
      return sendResponse_default(res = res, {
        status: 404,
        success: false,
        message: "Issue not found"
        //   data: result,
      });
    }
    sendResponse_default(res = res, {
      status: 200,
      success: true,
      //   message: "Issue created successfully",
      data: result
    });
  } catch (error) {
    sendResponse_default(res = res, {
      status: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var updateIssue = async (req, res) => {
  try {
    const { id: issueId } = req.params;
    const { id: userId } = req.user;
    const payload = { user: req.user, ...req.body };
    const result = await issuesService.updateIssueDB(
      payload,
      issueId
    );
    sendResponse_default(res = res, {
      status: 200,
      success: true,
      //   message: "Issue created successfully",
      data: result.rows[0]
    });
  } catch (error) {
    sendResponse_default(res = res, {
      status: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var deleteIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await issuesService.deleteIssueFromDB(id);
    if (result.rowCount === 0) {
      return sendResponse_default(res = res, {
        status: 404,
        success: false,
        message: "Issue not found"
        //   data: result,
      });
    }
    sendResponse_default(res = res, {
      status: 200,
      success: true,
      message: "Issue deleted successfully"
      //   data: result,
    });
  } catch (error) {
    sendResponse_default(res = res, {
      status: 500,
      success: false,
      message: error.message,
      error
    });
  }
};
var issuesController = {
  createIssue,
  getIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue
};

// src/modules/issues/issues.routes.ts
var router2 = (0, import_express2.Router)();
router2.post(
  "/",
  auth_default(USER_ROLE.maintainer, USER_ROLE.contributor),
  issuesController.createIssue
);
router2.get("/", issuesController.getIssues);
router2.get("/:id", issuesController.getSingleIssue);
router2.patch(
  "/:id",
  auth_default(USER_ROLE.maintainer, USER_ROLE.contributor),
  issuesController.updateIssue
);
router2.delete(
  "/:id",
  auth_default(USER_ROLE.maintainer),
  issuesController.deleteIssue
);
var issuesRouter = router2;

// src/app.ts
initDB();
var app = (0, import_express3.default)();
var port = config_default.port;
var db_connection_string = config_default.db_connection_string;
app.use(import_express3.default.json());
app.use(import_express3.default.text());
app.use(import_express3.default.urlencoded());
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Express Server running!",
    author: "ikhtiaj_arif",
    port
  });
});
app.use("/api/auth", userRouter);
app.use("/api/issues", issuesRouter);
app.use(globalErrorHandler_default);
var app_default = app;

// src/server.ts
var port2 = config_default.port;
var main = () => {
  initDB();
  app_default.listen(port2, () => {
    console.log(`Example app listening on port ${port2}`);
  });
};
main();
//! If maintainer update all issue, else own issue only when status === open
//# sourceMappingURL=server.cjs.map