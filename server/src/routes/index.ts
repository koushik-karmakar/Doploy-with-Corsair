import { Router, type Request, type Response } from "express";
import authRoutes from "./auth.routes.js";

// ─────────────────────────────────────────────
// ROOT API ROUTER
// ─────────────────────────────────────────────

const router = Router();

// ── Health Check ─────────────────────────────

/**
 * @route   GET /api/v1/health
 * @desc    Server health check — used by load balancers and monitoring
 * @access  Public
 */
router.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Echo Agent API is healthy",
    version: process.env.API_VERSION || "v1",
    environment: process.env.NODE_ENV || "development",
    uptime: `${Math.floor(process.uptime())}s`,
    timestamp: new Date().toISOString(),
  });
});

// ── Sub-routes ───────────────────────────────
router.use("/auth", authRoutes);

// More routes will be added here:
// router.use("/gmail", gmailRoutes);
// router.use("/calendar", calendarRoutes);
// router.use("/agent", agentRoutes);
// router.use("/webhook", webhookRoutes);

export default router;
