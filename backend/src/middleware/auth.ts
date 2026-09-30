import { Request, Response, NextFunction } from 'express';
import { cryptoUtil } from '../utils/crypto';
import { AppError } from './errorHandler';
import { AuthUser, UserRole } from '../types';

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Authentication required. Missing or malformed token.', 401, 'UNAUTHORIZED'));
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = cryptoUtil.verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (error: any) {
    return next(new AppError('Invalid or expired token', 401, 'TOKEN_EXPIRED'));
  }
};

export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401, 'UNAUTHORIZED'));
    }

    if (!allowedRoles.includes(req.user.roleCode)) {
      return next(
        new AppError(
          `Access forbidden: required role [${allowedRoles.join(', ')}], current [${req.user.roleCode}]`,
          403,
          'FORBIDDEN'
        )
      );
    }

    next();
  };
};

export const enforceTenant = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user || !req.user.organizationId) {
    return next(new AppError('Tenant context missing', 403, 'TENANT_REQUIRED'));
  }
  next();
};
