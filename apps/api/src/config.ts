import 'dotenv/config';

export function config() {
  return {
    port: parseInt(process.env['PORT'] ?? '3000', 10),
    mongoUrl: process.env['MONGO_URL'] ?? 'mongodb://localhost:27017/danrekki',
    jwtSecret: process.env['JWT_SECRET'] ?? 'dev-secret-change-in-production',
    jwtExpiresIn: process.env['JWT_EXPIRES_IN'] ?? '7d',
    featureFlag: {},
  };
}
