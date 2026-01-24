import { Controller, Get, Post, Body, Patch, Param, Delete, Res } from '@nestjs/common';
import { CountriesService } from '../services/countries.service';
import { CreateCountryDto } from '../dto/create-country.dto';
import { UpdateCountryDto } from '../dto/update-country.dto';
import * as express from 'express';
import { CountryDto } from '../dto/country.dto';
import { OkRes } from 'src/shared/utils';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FindAllCountriesResponseDto } from '../dto/find-all-countries-response.dto';

@ApiTags('Paises')
@Controller('countries')
export class CountriesController {
	constructor(private readonly countriesService: CountriesService) { }

	@Get()
	@ApiOperation({
		summary: 'Api para obtener todo los paises',
	})
	@ApiOkResponse({
		description: 'respuesta en caso de obtener todo los paises disponibles',
		type: FindAllCountriesResponseDto
	})
	async findAll(@Res() res: express.Response){
		const countries = await this.countriesService.findAll({
			where: {
				isActive: true
			},
			template: CountryDto
		})
		return OkRes(res,{
			countries: countries
		})
	}
}
