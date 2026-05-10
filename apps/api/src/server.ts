import { connectToDatabase } from './database/mongodb';
import { createApp } from './app';
import { config } from './config';

async function bootstrap() {
  const db = await connectToDatabase();
  const app = createApp(db);
  const { port } = config();
  app.listen(port, () => {
    console.log(`API listening on port ${port}`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});
