import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

const MONGO_URL = process.env.MONGO_URL ?? 'mongodb://localhost:27017/danrekki?replicaSet=rs0';
const EMAIL = process.env.ADMIN_EMAIL ?? 'admin@danrekki.com';
const PASSWORD = process.env.ADMIN_PASSWORD ?? 'admin123';

async function seed() {
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  const db = client.db();

  const existing = await db.collection('users').findOne({ email: EMAIL });
  if (existing) {
    console.log(`User ${EMAIL} already exists — skipping.`);
    await client.close();
    return;
  }

  const now = new Date().toISOString();
  await db.collection('users').insertOne({
    _id: randomUUID(),
    email: EMAIL,
    password_hash: await bcrypt.hash(PASSWORD, 10),
    role: 'admin',
    created_at: now,
    updated_at: now,
  });

  console.log(`Admin user created: ${EMAIL} / ${PASSWORD}`);
  await client.close();
}

seed().catch((err) => { console.error(err); process.exit(1); });
