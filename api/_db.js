import { MongoClient } from 'mongodb';

let cachedClient = null;

export async function connectDB() {
  if (cachedClient) return cachedClient.db();

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI not set');
  }

  const client = new MongoClient(uri);
  await client.connect();

  cachedClient = client;
  return client.db();
}
