import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db/prisma';
import { cryptoUtil } from '../utils/crypto';
import { AppError } from '../middleware/errorHandler';
import { auditService } from '../services/audit/audit.service';
import { AuthUser } from '../types';

export const authController = {
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        throw new AppError('Email and password are required', 400, 'VALIDATION_ERROR');
      }

      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
        include: { organization: true }
      });

      if (!user) {
        throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
      }

      const isMatch = await cryptoUtil.comparePassword(password, user.passwordHash);
      if (!isMatch) {
        throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
      }

      if (user.status !== 'ACTIVE') {
        throw new AppError('User account is suspended or inactive', 403, 'ACCOUNT_INACTIVE');
      }

      const authUser: AuthUser = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roleCode: user.roleCode as any,
        organizationId: user.organizationId
      };

      const accessToken = cryptoUtil.generateAccessToken(authUser);
      const refreshToken = cryptoUtil.generateRefreshToken(user.id);

      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      });

      await auditService.log({
        organizationId: user.organizationId,
        actorId: user.id,
        actorEmail: user.email,
        action: 'USER_LOGIN',
        entity: 'User',
        entityId: user.id,
        req
      });

      res.json({
        success: true,
        data: {
          accessToken,
          refreshToken,
          user: authUser,
          organization: {
            id: user.organization.id,
            name: user.organization.name,
            slug: user.organization.slug
          }
        }
      });
    } catch (err) {
      next(err);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        throw new AppError('Refresh token required', 400, 'TOKEN_REQUIRED');
      }

      const { id } = cryptoUtil.verifyRefreshToken(refreshToken);
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user || user.status !== 'ACTIVE') {
        throw new AppError('Invalid refresh token or inactive user', 401, 'UNAUTHORIZED');
      }

      const authUser: AuthUser = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roleCode: user.roleCode as any,
        organizationId: user.organizationId
      };

      const newAccessToken = cryptoUtil.generateAccessToken(authUser);
      const newRefreshToken = cryptoUtil.generateRefreshToken(user.id);

      res.json({
        success: true,
        data: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          user: authUser
        }
      });
    } catch (err) {
      next(new AppError('Invalid or expired refresh token', 401, 'INVALID_REFRESH_TOKEN'));
    }
  },

  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: { organization: true }
      });

      if (!user) {
        throw new AppError('User not found', 404, 'NOT_FOUND');
      }

      res.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roleCode: user.roleCode,
          organization: {
            id: user.organization.id,
            name: user.organization.name,
            slug: user.organization.slug,
            settings: JSON.parse(user.organization.settingsJson || '{}')
          }
        }
      });
    } catch (err) {
      next(err);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.user) {
        await auditService.log({
          organizationId: req.user.organizationId,
          actorId: req.user.id,
          actorEmail: req.user.email,
          action: 'USER_LOGOUT',
          entity: 'User',
          entityId: req.user.id,
          req
        });
      }
      res.json({ success: true, message: 'Logged out successfully' });
    } catch (err) {
      next(err);
    }
  }
};
