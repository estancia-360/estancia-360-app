import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtConfig } from 'src/app/auth/config/jwt.config';
import { UsersService } from 'src/modules/user-management/users/services/users.service';
import { UserDto } from 'src/modules/user-management/users/dto/user.dto';
import { InvalidTokenException } from '../exceptions';

// Keep the payload minimal — data here is embedded in every token and may become stale.
export interface JwtPayload {
    sub:    number; // user id
    email:  string;
    roleId: number;
}

// Shape of request.user after validate() runs. Accessed via @CurrentUser().
export interface AuthUser {
    id:     number;
    email:  string;
    roleId: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        jwtConfig: JwtConfig,
        private readonly usersService: UsersService,
    ) {
        super({
            jwtFromRequest:   ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey:      jwtConfig.secret,
        });
    }

    // A diferencia del scaffold base, revalida contra la DB en cada request (igual
    // que el proyecto viejo) — si el usuario fue borrado, un token todavía vigente
    // deja de funcionar de inmediato en vez de esperar su expiración natural.
    async validate(payload: JwtPayload): Promise<AuthUser> {
        const user = await this.usersService.findOneById(UserDto, payload.sub, { throwException: false });
        if (!user) throw new InvalidTokenException();

        return {
            id:     payload.sub,
            email:  payload.email,
            roleId: payload.roleId,
        };
    }
}
