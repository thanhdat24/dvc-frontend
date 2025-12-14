import { MongoClient } from "mongodb";

let cached = global._mongo;
if (!cached) cached = global._mongo = { conn: null, promise: null };

export async function getDb() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    if (!process.env.MONGODB_URI) throw new Error("Missing MONGODB_URI");
    cached.promise = new MongoClient(process.env.MONGODB_URI).connect();
  }
  const client = await cached.promise;
  cached.conn = client.db(); // default db in URI
  return cached.conn;
}
