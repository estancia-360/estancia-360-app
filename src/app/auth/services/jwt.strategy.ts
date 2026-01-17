import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { MyJwtConfig } from "src/infrastructure/config/services/jwt.config";
import { InvalidTokenException } from "../exceptions/invalid-token.exception";
import { UsersService } from "src/modules/user-management/users/services/users.service";
import { PayloadDto } from "../dto/jwt/payload.dto";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
    constructor(
        private readonly jwtConfig: MyJwtConfig,
        private readonly usersService: UsersService
    ) {
        const { secret } = jwtConfig.get();
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secret,
        });
    }

    async validate(payload?: PayloadDto) {
        if (!payload) {
            throw new InvalidTokenException()
        }

        const user = await this.usersService.findOneById(payload.id, {
            throwException: false,
        });

        if (!user) {
            throw new InvalidTokenException()
        }

        return payload;
    }
}