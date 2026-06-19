import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

// 1. O formato exato dos dados dentro do Token
export interface JwtPayload {
  sub: number;
  email: string;
  iat?: number;
  exp?: number;
}

// 2. Criamos um tipo de Request que já conhece a propriedade 'user'
export interface RequestWithUser extends Request {
  user: JwtPayload;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 3. Avisamos que o request é do nosso novo tipo (RequestWithUser)
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException(
        'Acesso negado. É necessário fazer login.',
      );
    }

    try {
      // 4. Passamos o tipo <JwtPayload> diretamente para a função.
      // Isto elimina qualquer "any" da operação.
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: 'chave-secreta-singu-123',
      });

      // 5. Atribuição direta e totalmente segura
      request.user = payload;
    } catch {
      throw new UnauthorizedException('Token inválido ou expirado.');
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) return undefined;

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
