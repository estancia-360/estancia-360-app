import { Controller, Get, Post, Body, Patch, Param, Delete, Res } from '@nestjs/common';
import { RanchUsersService } from '../services/ranch-users.service';
import { CreateRanchUserDto } from '../dto/create-ranch-user.dto';
import { UpdateRanchUserDto } from '../dto/update-ranch-user.dto';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateRanchUserWorkerDto } from '../dto/create-ranch-user-worker.dto';
import * as express from 'express';
import { RanchRolesEnum } from 'src/shared/enums';
import { CreatedRes } from 'src/shared/utils';
import { CommonResponseDto } from 'src/shared/dto';

@ApiTags('Usuarios de estancia')
@Controller('ranch-users')
export class RanchUsersController {
	constructor(private readonly ranchUsersService: RanchUsersService) { }

	@Post()
	@ApiOperation({
		summary: 'APi para agreagr un trabajador en la estancia'
	})
	@ApiCreatedResponse({
		description: 'Respuesta en caso de agregar a un trabajador',
		type: CommonResponseDto
	})
	async create(@Body() data: CreateRanchUserWorkerDto,@Res() res: express.Response){
		const ranchUser = await this.ranchUsersService.create({
			idRanch: data.idRanch,
			idUser: data.idUser,
			idRanchRole: RanchRolesEnum.WORKER	
		})
		return CreatedRes(res,{
			message: 'El usuario fue agregado como trabajador'
		})
	}
}
