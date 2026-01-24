import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Res } from '@nestjs/common';
import { CitiesService } from '../services/cities.service';
import { CreateCityDto } from '../dto/create-city.dto';
import { UpdateCityDto } from '../dto/update-city.dto';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import * as express from 'express';
import { CityDto } from '../dto/city.dto';
import { OkRes, SwaggerBadRequestCommon } from 'src/shared/utils';
import { FindAllCitiesRegionResponseDto } from '../dto/find-all-cities-region-response.dto';

@ApiTags('Ciudades')
@Controller('cities')
export class CitiesController {
	constructor(private readonly citiesService: CitiesService) { }

	@Get(':idRegion')
	@ApiOperation({
		summary: 'Api para obtener las ciudades de una region'
	})
	@ApiOkResponse({
		description: 'Repsuesta en caso de obtener la lista de regiones',
		type: FindAllCitiesRegionResponseDto
	})
	@ApiBadRequestResponse(SwaggerBadRequestCommon())
	async findAll(
		@Param('idRegion',ParseIntPipe) idRegion: number,
		@Res() res: express.Response
	){
		const cities = await this.citiesService.findAll({
			where: {
				idRegion: idRegion,
				isActive: true,
			},
			template: CityDto
		})
		return OkRes(res,{
			cities: cities
		})
	}
}
