import jwt from 'jsonwebtoken';
import { config } from '../config/config';

export type JwtPayload = { id: string; roles: string[] };

export class AuthService {
  static sign(payload: JwtPayload): string {
    return jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpires as string });
  }

  static verify(token: string): JwtPayload {
    return jwt.verify(token, config.jwtSecret) as JwtPayload;
  }
}
