import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/modules/user-management/users/services/users.service';
import { UserDto } from 'src/modules/user-management/users/dto/user.dto';
import { UserForAuthDto } from 'src/modules/user-management/users/dto/user-for-auth.dto';
import { CreateUserDto } from 'src/modules/user-management/users/dto/create-user.dto';
import { RoleEnum } from 'src/shared/enums/role.enum';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { LoginResponseDto } from '../dto/login-response.dto';
import { LoginWebResponseDto } from '../dto/login-web-response.dto';
import { RegisterResponseDto } from '../dto/register-response.dto';
import { JwtPayload } from '../strategies/jwt.strategy';
import { InvalidCredentialsException, InvalidResetCodeException } from '../exceptions';
import { comparePassword, hashPassword } from 'src/shared/utils/crypto.util';
import { generateCode } from 'src/shared/utils/code-generator.util';
import { MailerPort } from 'src/plugins/mailer/mailer.port';
import { VerificationCodeTemplate } from '../templates';

// Vigencia del código de recuperar contraseña. Corto a propósito — el flujo completo
// (pedir código → revisar email → volver a la app) toma minutos, no horas.
const RESET_CODE_TTL_MINUTES = 15;

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService:   JwtService,
        private readonly mailer:       MailerPort,
    ) {}

    // Login de mobile: idRanch único (la primera estancia donde es Owner, o null).
    // Mismo contrato que el proyecto viejo — mobile asume una sola estancia por
    // usuario, no tocar sin coordinar con mobile primero. Para el panel web, que sí
    // necesita elegir entre varias, ver loginWeb().
    async login(dto: LoginDto): Promise<LoginResponseDto> {
        const { user, accessToken } = await this.authenticate(dto);
        const ranches = await this.usersService.findRanchesWhereUserIsOwner(user.id);

        return {
            message: 'Ingreso exitoso',
            accessToken,
            idUser: user.id,
            idRole: user.role.id,
            idRanch: ranches[0]?.id ?? null,
        };
    }

    // Login del panel web: un usuario puede ser Owner de varias estancias, cada
    // una con un plan de suscripción distinto — el panel deja elegir con cuál
    // entrar antes de aplicar esa restricción, así que necesita la lista completa.
    async loginWeb(dto: LoginDto): Promise<LoginWebResponseDto> {
        const { user, accessToken } = await this.authenticate(dto);
        const ranches = await this.usersService.findRanchesWhereUserIsOwner(user.id);

        return {
            message: 'Ingreso exitoso',
            accessToken,
            idUser: user.id,
            idRole: user.role.id,
            // 12f (auditoria QA E2E, 2026-09-03): el panel mostraba "Usuario #N" porque el login
            // web nunca devolvia el nombre — no era un bug de UI, faltaba el dato en la respuesta.
            fullname: user.fullname,
            ranches,
        };
    }

    private async authenticate(dto: LoginDto): Promise<{ user: UserForAuthDto; accessToken: string }> {
        const user = await this.usersService.findOneByEmail(UserForAuthDto, dto.email, { throwException: false });
        if (!user) throw new InvalidCredentialsException();

        const passwordMatch = await comparePassword(dto.password, user.password);
        if (!passwordMatch) throw new InvalidCredentialsException();

        const payload: JwtPayload = { sub: user.id, email: user.email, roleId: user.role.id };
        const accessToken = this.jwtService.sign(payload);

        return { user, accessToken };
    }

    // El auto-registro siempre crea usuarios USER — quien necesite un rol distinto
    // (Admin/Root) se da de alta por el flujo administrativo (CreateUserDto sigue
    // aceptando roleId ahí). RegisterDto no tiene roleId, así que no hay nada que
    // el cliente pueda manipular acá.
    async register(dto: RegisterDto): Promise<RegisterResponseDto> {
        const createDto: CreateUserDto = { ...dto, roleId: RoleEnum.USER };
        const user = await this.usersService.create(UserDto, createDto);
        return { user };
    }

    async changePassword(idUser: number, dto: ChangePasswordDto): Promise<{ message: string }> {
        const user = await this.usersService.findOneById(UserForAuthDto, idUser);
        const currentMatches = await comparePassword(dto.currentPassword, user.password);
        if (!currentMatches) throw new InvalidCredentialsException();

        await this.usersService.updatePasswordById(idUser, dto.password);
        return { message: 'La contraseña se cambió exitosamente' };
    }

    // Recuperar contraseña — paso 1. Responde siempre el mismo mensaje genérico (exista
    // o no el email) para no filtrar qué correos están registrados. El código se guarda
    // hasheado (igual que la contraseña, nunca en texto plano) y nunca vuelve en la
    // respuesta HTTP — reemplaza al viejo /auth/2AF, que sí lo devolvía (deuda técnica
    // a propósito, ya cerrada).
    async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
        const message = 'Si el correo está registrado, enviamos un código de recuperación.';
        const user = await this.usersService.findOneByEmail(UserForAuthDto, dto.email, { throwException: false });
        if (!user) return { message };

        const code = generateCode(6);
        const expiresAt = new Date(Date.now() + RESET_CODE_TTL_MINUTES * 60_000);
        await this.usersService.setResetCode(user.id, await hashPassword(code), expiresAt);

        this.mailer.send({
            to:      user.email,
            subject: 'Recuperar contraseña',
            html:    VerificationCodeTemplate(Number(code), 'Recuperar contraseña', 'Usa este código para restablecer tu contraseña:', RESET_CODE_TTL_MINUTES),
        });

        return { message };
    }

    // Recuperar contraseña — paso 2. Verifica el código contra el hash guardado (y su
    // vencimiento) ANTES de aplicar la nueva contraseña — a diferencia del viejo 2FA,
    // acá sí hay verificación real del lado del servidor.
    async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
        const user = await this.usersService.findOneByEmail(UserForAuthDto, dto.email, { throwException: false });
        if (!user || !user.resetCodeHash || !user.resetCodeExpiresAt) throw new InvalidResetCodeException();
        if (user.resetCodeExpiresAt.getTime() < Date.now()) throw new InvalidResetCodeException();

        const codeMatches = await comparePassword(dto.code, user.resetCodeHash);
        if (!codeMatches) throw new InvalidResetCodeException();

        await this.usersService.resetPasswordWithCode(user.id, dto.password);
        return { message: 'Tu contraseña se actualizó exitosamente' };
    }
}
