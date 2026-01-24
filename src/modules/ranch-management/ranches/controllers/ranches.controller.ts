import { Controller, Get, Post, Body, Patch, Param, Delete, Res, ParseIntPipe } from '@nestjs/common';
import { RanchesService } from '../services/ranches.service';
import { CreateRanchDto } from '../dto/create-ranch.dto';
import { UpdateRanchDto } from '../dto/update-ranch.dto';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import * as express from 'express';
import { RanchDto } from '../dto/ranch.dto';
import { CreatedRes, OkRes, SwaggerBadRequestCommon, SwaggerNotFoundCommon } from 'src/shared/utils';
import { CreateRanchResponseDto } from '../dto/inputs/create-ranch-response.dto';
import { FindOneRanchResponseDto } from '../dto/find-one-ranch-response.dto';

@ApiTags('Estancias')
@Controller('ranches')
export class RanchesController {
	constructor(private readonly ranchesService: RanchesService) { }

	@Post()
	@ApiOperation({
		summary: 'Api para crear una estancia'
	})
	@ApiCreatedResponse({
		description: 'Respuesta en caso de crear una estancia exitosamente',
		type: CreateRanchResponseDto
	})
	async create(
		@Body() data: CreateRanchDto,
		@Res() res: express.Response
	){
		const ranch = await this.ranchesService.create(data,RanchDto)
		return CreatedRes(res,{
			message: 'La estancias fue creada exitosmente',
			ranch: ranch
		})
	}

	@Get(':idRanch')
	@ApiOperation({
		summary: 'Api para obtener informacion de una estancia',
	})
	@ApiOkResponse({
		description: 'respuesta en caso de obtener la estancia',
		type: FindOneRanchResponseDto
	})
	@ApiBadRequestResponse(SwaggerBadRequestCommon())
	@ApiNotFoundResponse(SwaggerNotFoundCommon())
	async findOne(
		@Param('idRanch',ParseIntPipe) idRanch: number,
		@Res() res: express.Response
	){
		const ranch = await this.ranchesService.findOneById(idRanch,{
			throwException: true,
			template: RanchDto
		})
		return OkRes(res,{
			ranch: ranch
		})
	}
}
