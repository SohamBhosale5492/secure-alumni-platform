const mongoose = require("mongoose");
const env = require("./env");

async function connectDB() {
  if (env.useMemoryDb) {
    const { MongoMemoryServer } = require("mongodb-memory-server");
    const memoryServer = await MongoMemoryServer.create({
      instance: {
        dbName: "secure-alumni-platform"
      }
    });
    const uri = memoryServer.getUri();

    mongoose.connection.on("disconnected", async () => {
      await memoryServer.stop();
    });

    mongoose.set("strictQuery", true);
    return mongoose.connect(uri);
  }

  if (!env.mongoUri) {
    throw new Error("MONGODB_URI is required. Add it to alumni-platform/backend/.env.");
  }

  mongoose.set("strictQuery", true);

  const connection = await mongoose.connect(env.mongoUri, {
    serverSelectionTimeoutMS: 5000
  });
  return connection;
}

module.exports = connectDB;
