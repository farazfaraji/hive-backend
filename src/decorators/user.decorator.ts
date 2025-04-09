import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserProfileModel } from 'src/services/auth.service';

export const User = createParamDecorator(
  (data: string, ctx: ExecutionContext): UserProfileModel | string => {
    const request = ctx.switchToHttp().getRequest();
    const user: UserProfileModel = request.user;
    return data ? user?.[data] : user;
  },
);
