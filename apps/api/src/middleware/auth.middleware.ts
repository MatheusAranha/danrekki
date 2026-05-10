import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import { ITokenPayload, UserRole } from '@danrekki/shared';
import { JwtTokenService } from '../infrastructure/jwt-token-service';
import { config } from '../config';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: ITokenPayload;
    }
  }
}

function getTokenService(): JwtTokenService {
  const { jwtSecret, jwtExpiresIn } = config();
  return new JwtTokenService(jwtSecret, jwtExpiresIn);
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const raw = req.headers['authorization'];
  const token = raw?.startsWith('Bearer ') ? raw.slice(7) : undefined;
  if (!token) return next(createHttpError(401, 'No authorization token provided'));

  try {
    req.user = getTokenService().verify(token);
    next();
  } catch {
    next(createHttpError(401, 'Invalid or expired token'));
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(createHttpError(403, 'Insufficient permissions'));
    }
    next();
  };
}

export const requireAdmin = requireRole('admin');
