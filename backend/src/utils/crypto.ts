import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AuthUser } from '../types';

export const cryptoUtil = {
  generateToken: (bytes = 32): string => {
    return crypto.randomBytes(bytes).toString('hex');
  },

  hashToken: (token: string): string => {
    return crypto.createHash('sha256').update(token).digest('hex');
  },

  getHint: (token: string): string => {
    return token.length > 6 ? token.slice(-6) : token;
  },

  hashPassword: async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  },

  comparePassword: async (password: string, hash: string): Promise<boolean> => {
    return bcrypt.compare(password, hash);
  },

  generateAccessToken: (user: AuthUser): string => {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roleCode: user.roleCode,
        organizationId: user.organizationId
      },
      config.jwt.secret,
      { expiresIn: '1h' }
    );
  },

  generateRefreshToken: (userId: string): string => {
    return jwt.sign({ id: userId }, config.jwt.refreshSecret, {
      expiresIn: '7d'
    });
  },

  verifyAccessToken: (token: string): AuthUser => {
    return jwt.verify(token, config.jwt.secret) as AuthUser;
  },

  verifyRefreshToken: (token: string): { id: string } => {
    return jwt.verify(token, config.jwt.refreshSecret) as { id: string };
  }
};
