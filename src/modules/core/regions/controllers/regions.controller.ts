import { Controller, Get, Post, Body, Patch, Param, Delete, Res, ParseIntPipe } from '@nestjs/common';
import { RegionsService } from '../services/regions.service';
import { CreateRegionDto } from '../dto/create-region.dto';
import { UpdateRegionDto } from '../dto/update-region.dto';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import * as express from 'express';
import { RegionDto } from '../dto/region.dto';
import { OkRes, SwaggerBadRequestCommon } from 'src/shared/utils';
import { FindAllRegionsCountryResponseDto } from '../dto/find-all-regions-country-response.dto';

@ApiTags('Regiones')
@Controller('regions')
export class RegionsController {
	constructor(private readonly regionsService: RegionsService) { }

	@Get(':idCountry')
	@ApiOperation({
		summary: 'Api para obtener las lista de as regiones por pais'
	})
	@ApiOkResponse({
		description: 'respuesta en caso de obtener las lista de regiones',
		type: FindAllRegionsCountryResponseDto
	})
	@ApiBadRequestResponse(SwaggerBadRequestCommon())
	async findAll(
		@Param('idCountry',ParseIntPipe) idCountry: number,
		@Res() res: express.Response
	){
		const regions = await this.regionsService.findAll({
			where: {
				idCountry: idCountry,
				isActive: true
			},
			template: RegionDto
		})
		return OkRes(res,{
			regions: regions
		})
	}
}
