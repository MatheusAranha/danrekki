export type UserRole = 'admin' | 'player';

export interface ITokenPayload {
  user_id: string;
  email: string;
  role: UserRole;
}

export abstract class TokenService {
  abstract sign(payload: ITokenPayload): string;
  abstract verify(token: string): ITokenPayload;
}
