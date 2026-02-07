import { Controller, Get, Post, Body, Patch, Param, Delete, Res } from '@nestjs/common';
import { AnimalStatusesService } from '../services/animal-statuses.service';
import { CreateAnimalStatusDto } from '../dto/create-animal-status.dto';
import { UpdateAnimalStatusDto } from '../dto/update-animal-status.dto';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FindAllAnimalStatuesResponseDto } from '../dto/find-all-animal-statuses-response.dto';
import * as express from 'express'
import { OkRes } from 'src/shared/utils';

@ApiTags('Estados de animales')
@Controller('animal-statuses')
export class AnimalStatusesController {
	constructor(private readonly animalStatusesService: AnimalStatusesService) { }

	@Get()
	@ApiOperation({
		summary: 'APi par obtener los estados de animales',
	})
	@ApiOkResponse({
		description: 'Respuesta en caod de obtener los estado de animales',
		type: FindAllAnimalStatuesResponseDto
	})
	async findAll(@Res() res: express.Response){
		const statues = await this.animalStatusesService.findAll({
			where: {
				isActive: true
			}
		})
		return OkRes(res,{
			statues: statues
		})
	}
}
