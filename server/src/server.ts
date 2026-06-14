import "dotenv/config";
import app from "./app.js";
import { env } from "./env.js";
import { testDatabaseConnection, closeDatabasePool } from "./config/db.js";

async function startServer() {
  const isConnected = await testDatabaseConnection();

  if (!isConnected) {
    console.error("Failed to connect to database");
    process.exit(1);
  }

  const server = app.listen(env.PORT, () => {
    console.log("═══════════════════════════════════════");
    console.log("Echo Agent API Started");
    console.log(`Port: ${env.PORT}`);
    console.log(`Environment: ${env.NODE_ENV}`);
    console.log(`API: http://localhost:${env.PORT}/api/${env.API_VERSION}`);
    console.log("═══════════════════════════════════════");
  });

  const gracefulShutdown = async (signal: string) => {
    console.log(`\n${signal} received. Shutting down...`);

    server.close(async () => {
      await closeDatabasePool();
      console.log("Server closed");
      process.exit(0);
    });

    setTimeout(() => {
      console.error("Force shutdown");
      process.exit(1);
    }, 10000);
  };

  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

  process.on("unhandledRejection", (reason) => {
    console.error("Unhandled Rejection:", reason);
  });

  process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception:", error);
    process.exit(1);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
