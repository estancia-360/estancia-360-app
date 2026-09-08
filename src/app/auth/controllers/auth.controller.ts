import { Body, Controller, Post, Put, HttpCode, HttpStatus } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
    ApiTags, ApiOperation, ApiBearerAuth,
    ApiCreatedResponse, ApiOkResponse,
} from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { LoginResponseDto } from '../dto/login-response.dto';
import { LoginWebResponseDto } from '../dto/login-web-response.dto';
import { RegisterResponseDto } from '../dto/register-response.dto';
import { Public, UserUp } from '../decorators';
import { CurrentUser } from 'src/shared/decorators';
import { ApiValidationError, ApiUnauthorized, ApiConflict } from 'src/shared/utils/swagger';
import { AUTH_THROTTLE_TTL_MS, AUTH_THROTTLE_LIMIT } from '../config/throttler.config';

/**
 * Error dictionary for this module:
 *   INVALID_CREDENTIALS 401 — Email not found or password does not match.
 *   INVALID_TOKEN        401 — Access JWT is missing, malformed, expired, or the user no longer exists.
 *   USER_ALREADY_EXISTS 409 — A user with the given email or CI already exists.
 *   INVALID_RESET_CODE  400 — Recovery code is missing, wrong, or expired.
 *   429 THROTTLER_LIMIT_DETECTED — too many requests from this IP for login/register/
 *     forgot-password/reset-password (ver AUTH_THROTTLE_LIMIT en config/throttler.config.ts).
 *
 * Sin refresh token — un único access token (JWT_TIME_EXPIRE, default 15m).
 */
const AUTH_THROTTLE = { default: { limit: AUTH_THROTTLE_LIMIT, ttl: AUTH_THROTTLE_TTL_MS } };
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Public()
    @Throttle(AUTH_THROTTLE)
    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Login' })
    @ApiOkResponse({ type: LoginResponseDto })
    @ApiValidationError()
    async login(@Body() dto: LoginDto): Promise<LoginResponseDto> {
        return await this.authService.login(dto);
    }

    @Public()
    @Throttle(AUTH_THROTTLE)
    @Post('login/web')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Login (panel web)',
        description: 'Igual que /auth/login, pero devuelve todas las estancias donde el usuario tiene una membresía activa (Owner o Administrator), no solo una.',
    })
    @ApiOkResponse({ type: LoginWebResponseDto })
    @ApiValidationError()
    async loginWeb(@Body() dto: LoginDto): Promise<LoginWebResponseDto> {
        return await this.authService.loginWeb(dto);
    }

    @Public()
    @Throttle(AUTH_THROTTLE)
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Register' })
    @ApiCreatedResponse({ type: RegisterResponseDto })
    @ApiValidationError()
    @ApiConflict({ code: 'USER_ALREADY_EXISTS', message: 'A user with this email or CI already exists.' })
    async register(@Body() dto: RegisterDto): Promise<RegisterResponseDto> {
        return await this.authService.register(dto);
    }

    @UserUp()
    @ApiBearerAuth('access-token')
    @Put('change-password')
    @ApiOperation({ summary: 'Change password', description: 'Requiere JWT — opera sobre el usuario autenticado, verificando su contraseña actual.' })
    @ApiOkResponse({ schema: { example: { message: 'La contraseña se cambió exitosamente' } } })
    @ApiValidationError()
    @ApiUnauthorized({ code: 'INVALID_CREDENTIALS', message: 'Current password does not match.' })
    async changePassword(@CurrentUser('id') idUser: number, @Body() dto: ChangePasswordDto): Promise<{ message: string }> {
        return await this.authService.changePassword(idUser, dto);
    }

    @Public()
    @Throttle(AUTH_THROTTLE)
    @Post('forgot-password')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Forgot password — step 1',
        description: 'Envía un código de 6 dígitos por email si el correo está registrado. Responde siempre el mismo mensaje genérico, exista o no el correo.',
    })
    @ApiOkResponse({ schema: { example: { message: 'Si el correo está registrado, enviamos un código de recuperación.' } } })
    @ApiValidationError()
    async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<{ message: string }> {
        return await this.authService.forgotPassword(dto);
    }

    @Public()
    @Throttle(AUTH_THROTTLE)
    @Post('reset-password')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Forgot password — step 2',
        description: 'Verifica el código de recuperación contra el hash guardado en el servidor y, si es válido y no venció, aplica la nueva contraseña.',
    })
    @ApiOkResponse({ schema: { example: { message: 'Tu contraseña se actualizó exitosamente' } } })
    @ApiValidationError()
    async resetPassword(@Body() dto: ResetPasswordDto): Promise<{ message: string }> {
        return await this.authService.resetPassword(dto);
    }
}
