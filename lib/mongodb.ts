import mongoose from "mongoose";

/**
 * Production-safe reusable MongoDB connection.
 * - Reuses a cached connection across hot reloads (dev) and serverless invocations (prod).
 * - Does not throw at import time so builds never require a live DB.
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

const globalForMongoose = globalThis as unknown as { __ecrmMongoose?: MongooseCache };

const cache: MongooseCache = globalForMongoose.__ecrmMongoose ?? { conn: null, promise: null };
globalForMongoose.__ecrmMongoose = cache;

export async function connectDB(): Promise<typeof mongoose> {
  if (cache.conn) return cache.conn;

  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI is not set. Configure it in .env (see .env.example).");

  const dbName = process.env.MONGO_DB_NAME || "eternitycrm_website";

  if (!cache.promise) {
    cache.promise = mongoose.connect(uri, { dbName }).catch((err) => {
      cache.promise = null;
      throw err;
    });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}
