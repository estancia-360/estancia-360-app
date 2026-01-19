import { Body, Controller, Post, Put, Res } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { ApiOperation, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiUnauthorizedResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { RoleEnum } from 'src/shared/enums';
import { SwaggerNotFoundCommon, CreatedRes, SwaggerBadRequestCommon, OkRes } from 'src/shared/utils';
import { RegisterClientResponseDto } from '../dto/outputs/register-client-response.dto';
import { RegisterDto } from '../dto/register.dto';
import express from 'express';
import { LoginResponseDto } from '../dto/outputs/login-response.dto';
import { LoginDto } from '../dto/inputs/login.dto';
import { CommonResponseDto } from 'src/shared/dto';
import { ChangePasswordDto } from '../dto/inputs/change-password.dto';

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

	@Put('change-password')
	@ApiOperation({
		summary: 'api par acmabiar de contrasena',
	})
	@ApiOkResponse({
		description: 'Respuesta al cambiar la contrasena',
		type: CommonResponseDto
	})
	@ApiBadRequestResponse(SwaggerBadRequestCommon())
	@ApiNotFoundResponse(SwaggerNotFoundCommon())
	async changePassword(@Body() data: ChangePasswordDto,@Res() res: express.Response){
		const user = await this.authService.changePassword(data);
		return OkRes(res,{
			message: 'La contrasena se cambio exitosamente'
		})
	}
}
