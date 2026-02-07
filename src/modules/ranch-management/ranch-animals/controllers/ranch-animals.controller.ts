import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Query, ParseIntPipe } from '@nestjs/common';
import { RanchAnimalsService } from '../services/ranch-animals.service';
import { CreateRanchAnimalDto } from '../dto/create-ranch-animal.dto';
import { UpdateRanchAnimalDto } from '../dto/update-ranch-animal.dto';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import * as express from 'express';
import { RanchAnimalDto } from '../dto/ranch-animal.dto';
import { CreatedRes, OkRes, SwaggerBadRequestCommon, SwaggerNotFoundCommon } from 'src/shared/utils';
import { FindAllRanchAnimalsResponseDto } from '../dto/find-all-ranch-animals-response.dto';
import { CommonResponseDto } from 'src/shared/dto';
import { FindAllRanchAnimalsParamsDto } from '../dto/inputs/find-all-ranch-animals-params.dto';

@ApiTags('Animales de estancia')
@Controller('ranch-animals')
export class RanchAnimalsController {
	constructor(private readonly ranchAnimalsService: RanchAnimalsService) { }

	@Post()
	@ApiOperation({
		summary: 'Api para registrar un animal en la estancia',
	})
	@ApiCreatedResponse({
		type: CommonResponseDto,
		description: 'Respuesta en caso de registrar exitosamente al animal'
	})
	@ApiBadRequestResponse(SwaggerBadRequestCommon())
	@ApiNotFoundResponse(SwaggerNotFoundCommon())
	async create(
		@Res() res: express.Response,
		@Body() data: CreateRanchAnimalDto,
	){
		const animal = await this.ranchAnimalsService.create(data,RanchAnimalDto)
		return CreatedRes(res,{
			message: 'Se registro el animal exitosamente'
		})
	}

	@Get(':idRanch')
	@ApiOperation({
		summary: 'Api para obtner todos los animales de estancia'
	})
	@ApiOkResponse({
		type: FindAllRanchAnimalsResponseDto,
		description: 'Repsuesta en caso de obtener todos los animaes xitosmente'
	})
	async findAll(
		@Param('idRanch',ParseIntPipe) idRanch: number,
		@Query() data: FindAllRanchAnimalsParamsDto,
		@Res() res: express.Response
	){
		const animals = await this.ranchAnimalsService.findAll(
			idRanch,
			data,
			{
				template: RanchAnimalDto
			}
		)
		return OkRes(res,animals)
	}
}
