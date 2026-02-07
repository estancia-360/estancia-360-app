import { Controller, Get, Post, Body, Patch, Param, Delete, Res } from '@nestjs/common';
import { AnimalBreedsService } from '../services/animal-breeds.service';
import { CreateAnimalBreedDto } from '../dto/create-animal-breed.dto';
import { UpdateAnimalBreedDto } from '../dto/update-animal-breed.dto';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import * as express from 'express';
import { OkRes } from 'src/shared/utils';
import { FindAllBreedsResopnseDto } from '../dto/find-all-breeds-response.dto';

@ApiTags('Razas de animales')
@Controller('animal-breeds')
export class AnimalBreedsController {
	constructor(private readonly animalBreedsService: AnimalBreedsService) { }

	@Get()
	@ApiOperation({
		summary: 'Api para obtener todoas las razas de animales',
	})
	@ApiOkResponse({
		description: 'respuesta en caso de obtener todas las raza de animales',
		type: FindAllBreedsResopnseDto
	})
	async findAll(@Res() res:express.Response ){
		const breeds = await this.animalBreedsService.findAll({
			where: {
				isActive: true
			}
		})
		return OkRes(res,{
			breeds: breeds
		})
	}
}
