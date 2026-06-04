import { randomUUID } from 'crypto';
import { Db } from 'mongodb';
import { OAuth2Client } from 'google-auth-library';
import { JwtTokenService } from '../infrastructure/jwt-token-service';
import { config } from '../config';

interface GoogleUserDoc {
  _id: string;
  googleId: string;
  email: string;
  name: string;
  picture: string;
  role: 'admin' | 'player';
  createdAt: Date;
}

interface UserDoc {
  _id: string;
  email: string;
  password_hash: string;
  role: 'admin' | 'player';
  created_at: string;
  updated_at: string;
}

export interface GoogleUserPublic {
  id: string;
  email: string;
  name: string;
  picture: string;
  role: 'admin' | 'player';
}

export async function handleGoogleAuth(
  db: Db,
  credential: string,
): Promise<{ token: string; user: GoogleUserPublic }> {
  const { jwtSecret, jwtExpiresIn, googleClientId } = config();

  const oauthClient = new OAuth2Client(googleClientId);
  const ticket = await oauthClient.verifyIdToken({ idToken: credential, audience: googleClientId });
  const payload = ticket.getPayload();
  if (!payload?.sub) throw new Error('Invalid Google token payload');

  const { sub: googleId, email, name, picture } = payload;
  const googleCol = db.collection<GoogleUserDoc>('google_users');
  const usersCol = db.collection<UserDoc>('users');

  const existing = await googleCol.findOne({ googleId } as never);
  let doc: GoogleUserDoc;

  if (existing) {
    await googleCol.updateOne(
      { googleId } as never,
      { $set: { email: email ?? existing.email, name: name ?? existing.name, picture: picture ?? existing.picture } },
    );
    doc = { ...existing, email: email ?? existing.email, name: name ?? existing.name, picture: picture ?? existing.picture };
  } else {
    doc = {
      _id: randomUUID(),
      googleId,
      email: email ?? '',
      name: name ?? '',
      picture: picture ?? '',
      role: 'player',
      createdAt: new Date(),
    };
    await googleCol.insertOne(doc as never);
  }

  // Ensure the user exists in the main `users` collection so admins can see them.
  // Uses the same _id as the google_users record for consistency.
  const existingUser = await usersCol.findOne({ _id: doc._id } as never);
  if (!existingUser) {
    const now = new Date().toISOString();
    await usersCol.insertOne({
      _id: doc._id,
      email: doc.email,
      password_hash: '__google__', // sentinel — prevents password-based login
      role: doc.role,
      created_at: now,
      updated_at: now,
    } as never);
  }

  const tokenService = new JwtTokenService(jwtSecret, jwtExpiresIn);
  const token = tokenService.sign({ user_id: doc._id, email: doc.email, role: doc.role });

  return { token, user: { id: doc._id, email: doc.email, name: doc.name, picture: doc.picture, role: doc.role } };
}

export async function getGoogleUser(db: Db, userId: string): Promise<GoogleUserPublic | null> {
  const collection = db.collection<GoogleUserDoc>('google_users');
  const doc = await collection.findOne({ _id: userId } as never);
  if (!doc) return null;
  return { id: doc._id, email: doc.email, name: doc.name, picture: doc.picture, role: doc.role };
}
