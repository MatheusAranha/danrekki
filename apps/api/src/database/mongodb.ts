import { MongoClient, Db } from 'mongodb';
import { config } from '../config';

let client: MongoClient;
let db: Db;

export async function connectToDatabase(): Promise<Db> {
  if (db) return db;
  const { mongoUrl } = config();
  client = new MongoClient(mongoUrl);
  await client.connect();
  db = client.db();
  return db;
}

export async function closeDatabase(): Promise<void> {
  if (client) await client.close();
}
