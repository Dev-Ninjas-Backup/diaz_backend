import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class RoleAuthGuard implements CanActivate {
  constructor(private requiredRole: string[]) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !this.requiredRole.includes(user.role)) {
      throw new ForbiddenException('Access denied: insufficient role');
    }
    return true;
  }
}
