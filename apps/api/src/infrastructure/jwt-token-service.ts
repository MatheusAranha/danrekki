import jwt from 'jsonwebtoken';
import { TokenService, ITokenPayload } from '@danrekki/shared';

export class JwtTokenService extends TokenService {
  constructor(
    private readonly secret: string,
    private readonly expiresIn: string,
  ) {
    super();
  }

  sign(payload: ITokenPayload): string {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn } as jwt.SignOptions);
  }

  verify(token: string): ITokenPayload {
    return jwt.verify(token, this.secret) as ITokenPayload;
  }
}
