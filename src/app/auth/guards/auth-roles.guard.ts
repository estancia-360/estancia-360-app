import { Injectable, CanActivate, ExecutionContext, Type, mixin, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { PermissionDeniedException } from '../exceptions/permission-denied.exception';

export const AuthRolesGuard = (roles: number[]): Type<CanActivate> => {
	@Injectable()
	class MixinAuthRolesGuard extends AuthGuard('jwt') {
		constructor(private reflector: Reflector) {
			super();
		}

		async canActivate(context: ExecutionContext): Promise<boolean> {
			const jwtValid = (await super.canActivate(context)) as boolean;
			if (!jwtValid) return false;
			const { user } = context.switchToHttp().getRequest();
			if (!roles || roles.length === 0) return true;
			const isAllowed = roles.some((rol) => user.idRole <= rol);
			if (!isAllowed) {
				throw new PermissionDeniedException()
			}
			return true
		}
	}

	return mixin(MixinAuthRolesGuard);
};
