import express from "express";
import { env } from "./env.js";
import { SecurityMiddleware } from "./middlewares/Security.middleware.js";
import {
  errorHandler,
  notFoundHandler,
} from "./middlewares/Error.middleware.js";
import apiRouter from "./routes/index.js";

const app = express();

app.use(
  express.json({
    limit: "10kb",
    strict: true,
  }),
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10kb",
  }),
);

SecurityMiddleware.apply(app);

const prefix = `/api/${env.API_VERSION}`;

app.use(prefix, apiRouter);

app.get("/", (_req, res) => {
  res.json({
    name: "Echo Agent API",
    version: env.API_VERSION,
    status: "running",
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
