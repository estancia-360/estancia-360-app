import { Body, Controller, Post, Res } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { ApiOperation, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiUnauthorizedResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { RoleEnum } from 'src/shared/enums';
import { SwaggerNotFoundCommon, CreatedRes, SwaggerBadRequestCommon, OkRes } from 'src/shared/utils';
import { RegisterClientResponseDto } from '../dto/outputs/register-client-response.dto';
import { RegisterDto } from '../dto/register.dto';
import express from 'express';
import { LoginResponseDto } from '../dto/outputs/login-response.dto';
import { LoginDto } from '../dto/inputs/login.dto';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) { }

	@Post('register')
	@ApiOperation({
		summary: 'Api para registro de un usuario nuevo'
	})
	@ApiCreatedResponse({
		description: 'Respuesta en caso de crear el usuario exitosamente',
		type: RegisterClientResponseDto
	})
	@ApiNotFoundResponse(SwaggerNotFoundCommon())
	async register(@Body() data: RegisterDto, @Res() res: express.Response) {
		return CreatedRes(res, {
			user: await this.authService.register(data)
		})
	}

	@Post('login')
	@ApiOperation({
		summary: 'Api par ainicar sesion en el sistema'
	})
	@ApiOkResponse({
		description: 'Respuesta en caso de ingresar correctamente',
		type: LoginResponseDto
	})
	@ApiUnauthorizedResponse({
		description: 'Respuesta en caso de ingresar mal las credenciales'
	})
	@ApiBadRequestResponse(SwaggerBadRequestCommon())
	async login(@Body() data: LoginDto, @Res() res: express.Response) {
		return OkRes(res, await this.authService.login(data))
	}
}
