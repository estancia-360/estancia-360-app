import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { RegionsService } from '../services/regions.service';
import { RegionDto } from '../dto/region.dto';
import { Public } from 'src/app/auth/decorators';

@ApiTags('Regions')
@Controller('regions')
export class RegionsController {
    constructor(private readonly regionsService: RegionsService) {}

    @Get(':idCountry')
    @Public()
    @ApiOperation({ summary: 'List active regions for a country' })
    @ApiOkResponse({ schema: { example: { regions: [{ id: 7, name: 'Santa Cruz' }] } } })
    async findAllByCountry(@Param('idCountry', ParseIntPipe) idCountry: number): Promise<{ regions: RegionDto[] }> {
        return { regions: await this.regionsService.findAllByCountry(RegionDto, idCountry) };
    }
}
