import { Body, Controller, Post, Put, HttpCode, HttpStatus } from '@nestjs/common';
import {
    ApiTags, ApiOperation,
    ApiCreatedResponse, ApiOkResponse,
} from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { TwoFactorCodeDto } from '../dto/two-factor-code.dto';
import { LoginResponseDto } from '../dto/login-response.dto';
import { LoginWebResponseDto } from '../dto/login-web-response.dto';
import { RegisterResponseDto } from '../dto/register-response.dto';
import { TwoFactorCodeResponseDto } from '../dto/two-factor-code-response.dto';
import { Public } from '../decorators';
import { ApiValidationError, ApiUnauthorized, ApiConflict } from 'src/shared/utils/swagger';

/**
 * Error dictionary for this module:
 *   INVALID_CREDENTIALS 401 — Email not found or password does not match.
 *   INVALID_TOKEN        401 — Access JWT is missing, malformed, expired, or the user no longer exists.
 *   USER_ALREADY_EXISTS 409 — A user with the given email or CI already exists.
 *
 * Sin refresh token — un único access token (JWT_TIME_EXPIRE, default 15m).
 */
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Login' })
    @ApiOkResponse({ type: LoginResponseDto })
    @ApiValidationError()
    async login(@Body() dto: LoginDto): Promise<LoginResponseDto> {
        return await this.authService.login(dto);
    }

    @Public()
    @Post('login/web')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Login (panel web)',
        description: 'Igual que /auth/login, pero devuelve todas las estancias donde el usuario es Owner en vez de una sola.',
    })
    @ApiOkResponse({ type: LoginWebResponseDto })
    @ApiValidationError()
    async loginWeb(@Body() dto: LoginDto): Promise<LoginWebResponseDto> {
        return await this.authService.loginWeb(dto);
    }

    @Public()
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Register' })
    @ApiCreatedResponse({ type: RegisterResponseDto })
    @ApiValidationError()
    @ApiConflict({ code: 'USER_ALREADY_EXISTS', message: 'A user with this email or CI already exists.' })
    async register(@Body() dto: RegisterDto): Promise<RegisterResponseDto> {
        return await this.authService.register(dto);
    }

    @Public()
    @Put('change-password')
    @ApiOperation({ summary: 'Change password' })
    @ApiOkResponse({ schema: { example: { message: 'La contraseña se cambió exitosamente' } } })
    @ApiValidationError()
    async changePassword(@Body() dto: ChangePasswordDto): Promise<{ message: string }> {
        return await this.authService.changePassword(dto);
    }

    @Public()
    @Post('2AF')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Send two-factor verification code' })
    @ApiOkResponse({ type: TwoFactorCodeResponseDto })
    async twoFactorCode(@Body() dto: TwoFactorCodeDto): Promise<TwoFactorCodeResponseDto> {
        return { code: await this.authService.auth2af(dto.email) };
    }
}
