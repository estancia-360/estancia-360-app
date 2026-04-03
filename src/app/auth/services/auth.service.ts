import { Injectable } from '@nestjs/common';
import { RegisterDto } from '../dto/register.dto';
import { UsersAuthService } from 'src/modules/user-management/users/services/users-auth.service';
import { UserDto } from 'src/modules/user-management/users/dto/user.dto';
import { LoginDto } from '../dto/inputs/login.dto';
import { UsersService } from 'src/modules/user-management/users/services/users.service';
import { UserAuthDto } from 'src/modules/user-management/users/dto/user-auth.dto';
import { IncorrectCredentialsException } from '../exceptions/incorrect-credentials.exception';
import { comparePassword, generateCode } from 'src/shared/utils';
import { PayloadDto } from '../dto/jwt/payload.dto';
import { MyJwtConfig } from 'src/infrastructure/config/services';
import { JwtService } from '@nestjs/jwt';
import * as ms from 'ms';
import { ChangePasswordDto } from '../dto/inputs/change-password.dto';
import { User } from 'src/modules/user-management/users/entities/user.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventsEnum } from 'src/shared/enums/events.enum';
import { TwoFactorCodeTemplate } from '../templates';

@Injectable()
export class AuthService {
	constructor(
		private readonly usersAuthService: UsersAuthService,
		private readonly usersService: UsersService,
		private readonly jwtConfig: MyJwtConfig,
        private readonly jwtService: JwtService,
        private readonly eventEmiter: EventEmitter2,
	){}

	async register(data: RegisterDto) {
		const user = await this.usersAuthService.create(data,UserDto);
        return user;
	}

	async login(data: LoginDto){
        const user = await this.usersService.findOneByEmail(data.email,{
            throwException: false,
            template: UserAuthDto
        })
        if (!user){
            throw new IncorrectCredentialsException()
        }
        const passwordCorrect = await comparePassword(data.password,user.password)
        if (!passwordCorrect){
            throw new IncorrectCredentialsException()
        }
        
        const payload: PayloadDto = {
            id: user.id,
            email: user.email,
            idRole: user.role.id
        }
        const { secret, expiresIn } = this.jwtConfig.get();
        const expires = expiresIn as ms.StringValue;
        const token = this.jwtService.sign(payload, { secret, expiresIn: expires });
        
        // Obtener ID de la estancia si el usuario es dueño
        const idRanch = await this.usersService.findRanchIdWhereUserIsOwner(user.id);
        
        return {
            message: 'Ingreso exitoso',
            accessToken: token,
            idUser: user.id,
            idRole: user.role.id,
            idRanch: idRanch  // null si no es dueño
        };
    }

    async changePassword(data: ChangePasswordDto){
        const user = await this.usersService.findOneByEmail(data.email,{
            template: User,
            throwException: true,
            where: {
                isDeleted: false,
            }
        })
        const userUpdated = await this.usersAuthService.updateByEmail(data,user!);
        return userUpdated;
    }

    async auth2af(email: string): Promise<number> {
        const user = await this.usersService.findOneByEmail(email,{
            throwException: true,
            template: UserDto,
            where: {
                isDeleted: false
            }
        })
        const code = generateCode(6);
        this.eventEmiter.emit(EventsEnum.SEND_MAIL, {
            to: user!.email,
            subject: 'Codigo para autenticacion de dos factores',
            html: TwoFactorCodeTemplate(code)
        })
        return code;
    }
}
