import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // Mock authentication for development
    const request = context.switchToHttp().getRequest();
    request.user = { id: '1', email: 'user@example.com' };
    return true;
  }
}