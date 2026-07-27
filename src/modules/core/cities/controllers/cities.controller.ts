import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { CitiesService } from '../services/cities.service';
import { CityDto } from '../dto/city.dto';
import { Public } from 'src/app/auth/decorators';

@ApiTags('Cities')
@Controller('cities')
export class CitiesController {
    constructor(private readonly citiesService: CitiesService) {}

    @Get(':idRegion')
    @Public()
    @ApiOperation({ summary: 'List active cities for a region' })
    @ApiOkResponse({ schema: { example: { cities: [{ id: 15, name: 'Santa Cruz de la Sierra' }] } } })
    async findAllByRegion(@Param('idRegion', ParseIntPipe) idRegion: number): Promise<{ cities: CityDto[] }> {
        return { cities: await this.citiesService.findAllByRegion(CityDto, idRegion) };
    }
}
