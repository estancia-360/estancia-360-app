import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/modules/user-management/users/services/users.service';
import { UserDto } from 'src/modules/user-management/users/dto/user.dto';
import { UserForAuthDto } from 'src/modules/user-management/users/dto/user-for-auth.dto';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { LoginResponseDto } from '../dto/login-response.dto';
import { RegisterResponseDto } from '../dto/register-response.dto';
import { JwtPayload } from '../strategies/jwt.strategy';
import { InvalidCredentialsException } from '../exceptions';
import { comparePassword } from 'src/shared/utils/crypto.util';
import { generateCode } from 'src/shared/utils/code-generator.util';
import { MailerPort } from 'src/plugins/mailer/mailer.port';
import { TwoFactorCodeTemplate } from '../templates';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService:   JwtService,
        private readonly mailer:       MailerPort,
    ) {}

    async login(dto: LoginDto): Promise<LoginResponseDto> {
        const user = await this.usersService.findOneByEmail(UserForAuthDto, dto.email, { throwException: false });
        if (!user) throw new InvalidCredentialsException();

        const passwordMatch = await comparePassword(dto.password, user.password);
        if (!passwordMatch) throw new InvalidCredentialsException();

        const payload: JwtPayload = { sub: user.id, email: user.email, roleId: user.role.id };
        const accessToken = this.jwtService.sign(payload);

        // idRanch = estancia donde el usuario es Owner, null si no es dueño de ninguna.
        const idRanch = await this.usersService.findRanchIdWhereUserIsOwner(user.id);

        return {
            message: 'Ingreso exitoso',
            accessToken,
            idUser: user.id,
            idRole: user.role.id,
            idRanch,
        };
    }

    // DEUDA TÉCNICA (a propósito — ver respuesta de Jaime, coordinar con mobile antes
    // de tocar): el registro público permite elegir cualquier idRole libremente, sin
    // restricción (cualquiera puede registrarse como Admin o Root). Igual que el viejo.
    async register(dto: RegisterDto): Promise<RegisterResponseDto> {
        const user = await this.usersService.create(UserDto, dto);
        return { user };
    }

    // DEUDA TÉCNICA (a propósito, ver arriba): sin JWT, sin verificar contraseña
    // actual — cualquiera que sepa el email de otra persona puede cambiarle la
    // contraseña sin autenticarse. Igual que el proyecto viejo.
    async changePassword(dto: ChangePasswordDto): Promise<{ message: string }> {
        await this.usersService.updatePasswordByEmail(dto.email, dto.password);
        return { message: 'La contraseña se cambió exitosamente' };
    }

    // DEUDA TÉCNICA (a propósito, ver arriba): el código se manda por email Y se
    // devuelve en la misma respuesta HTTP (anula su propio propósito), y no hay
    // endpoint para verificarlo después — parece incompleto. Igual que el viejo.
    async auth2af(email: string): Promise<number> {
        const user = await this.usersService.findOneByEmail(UserDto, email);
        const code = Number(generateCode(6));

        this.mailer.send({
            to:      user.email,
            subject: 'Código para autenticación de dos factores',
            html:    TwoFactorCodeTemplate(code),
        });

        return code;
    }
}
