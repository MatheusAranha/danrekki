import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import createHttpError, { isHttpError } from 'http-errors';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use((_req, _res, next) => {
    next(createHttpError(404, 'Route not found'));
  });

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (isHttpError(err)) {
      res.status(err.status).json({ error: err.message });
      return;
    }
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}
