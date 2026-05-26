import * as crypto from 'crypto';

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const generateRandomToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const generateSessionId = (): string => {
  return crypto.randomUUID();
};
