import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db/prisma';
import { cryptoUtil } from '../utils/crypto';
import { auditService } from '../services/audit/audit.service';
import { AppError } from '../middleware/errorHandler';

export const usersController = {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user!.organizationId;

      const users = await prisma.user.findMany({
        where: { organizationId: orgId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          roleCode: true,
          status: true,
          lastLoginAt: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      });

      res.json({ success: true, data: users });
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orgId = req.user!.organizationId;
      const { email, password, firstName, lastName, roleCode } = req.body;

      if (!email || !password || !firstName || !lastName) {
        throw new AppError('All fields are required', 400, 'VALIDATION_ERROR');
      }

      const existing = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() }
      });
      if (existing) {
        throw new AppError('User with this email already exists', 409, 'USER_EXISTS');
      }

      const passwordHash = await cryptoUtil.hashPassword(password);
      const user = await prisma.user.create({
        data: {
          organizationId: orgId,
          email: email.toLowerCase().trim(),
          passwordHash,
          firstName,
          lastName,
          roleCode: roleCode || 'RECRUITER',
          status: 'ACTIVE'
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          roleCode: true,
          status: true,
          createdAt: true
        }
      });

      await auditService.log({
        organizationId: orgId,
        actorId: req.user!.id,
        actorEmail: req.user!.email,
        action: 'USER_CREATED',
        entity: 'User',
        entityId: user.id,
        metadata: { email: user.email, roleCode: user.roleCode },
        req
      });

      res.status(201).json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const orgId = req.user!.organizationId;
      const { firstName, lastName, roleCode, status } = req.body;

      const user = await prisma.user.findFirst({
        where: { id, organizationId: orgId }
      });
      if (!user) {
        throw new AppError('User not found', 404, 'NOT_FOUND');
      }

      const updated = await prisma.user.update({
        where: { id },
        data: {
          firstName,
          lastName,
          roleCode,
          status
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          roleCode: true,
          status: true
        }
      });

      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const orgId = req.user!.organizationId;

      const user = await prisma.user.findFirst({
        where: { id, organizationId: orgId }
      });
      if (!user) {
        throw new AppError('User not found', 404, 'NOT_FOUND');
      }

      if (user.id === req.user!.id) {
        throw new AppError('Cannot delete yourself', 400, 'CANNOT_DELETE_SELF');
      }

      await prisma.user.delete({ where: { id } });

      await auditService.log({
        organizationId: orgId,
        actorId: req.user!.id,
        actorEmail: req.user!.email,
        action: 'USER_DELETED',
        entity: 'User',
        entityId: id,
        req
      });

      res.json({ success: true, message: 'User deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
};
