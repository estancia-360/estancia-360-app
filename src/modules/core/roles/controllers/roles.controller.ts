import { Controller, Get, Post, Body, Patch, Param, Delete, Res } from '@nestjs/common';
import { RolesService } from '../services/roles.service';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FindAllRolesResponse } from '../dto/outputs/find-all-roles-response.dto';
import express from 'express';
import { OkRes } from 'src/shared/utils';

@ApiTags('Roles de usuario')
@Controller('roles')
export class RolesController {
	constructor(private readonly rolesService: RolesService) { }

	@Get('')
	@ApiOperation({
		summary: 'Api para obtener todos los roles'
	})
	@ApiOkResponse({
		description: 'Respuesta en caso de obtenet todo los roles',
		type: FindAllRolesResponse
	})
	async findAllRoles(@Res() res: express.Response){
		return OkRes(res,{
			roles: await this.rolesService.findAll()
		})
	}
}
