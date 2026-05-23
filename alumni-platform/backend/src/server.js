const app = require("./app");
const connectDB = require("./config/db");
const env = require("./config/env");

async function startServer() {
  try {
    await connectDB();

    app.listen(env.port, () => {
      console.log(`Secure Alumni API running on port ${env.port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();
