import { Controller, Get, Post, Body, Param, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { RanchesService } from '../services/ranches.service';
import { CreateRanchDto } from '../dto/create-ranch.dto';
import { RanchDto } from '../dto/ranch.dto';
import { RanchDetailedDto } from '../dto/ranch-detailed.dto';
import { UserUp } from 'src/app/auth/decorators';
import { ApiNotFound } from 'src/shared/utils/swagger';

@ApiTags('Ranches')
@ApiBearerAuth('access-token')
@Controller('ranches')
export class RanchesController {
    constructor(private readonly ranchesService: RanchesService) {}

    @Post()
    @UserUp()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a ranch (quien la crea queda como Owner)' })
    @ApiCreatedResponse({ schema: { example: { message: 'La estancia fue creada exitosamente', ranch: {} } } })
    async create(@Body() dto: CreateRanchDto): Promise<{ message: string; ranch: RanchDto }> {
        const ranch = await this.ranchesService.create(dto, RanchDto);
        return { message: 'La estancia fue creada exitosamente', ranch };
    }

    @Get(':idRanch')
    @UserUp()
    @ApiOperation({ summary: 'Get detailed ranch info (city, production types, users)' })
    @ApiOkResponse({ type: RanchDetailedDto })
    @ApiNotFound({ code: 'RANCH_NOT_FOUND', message: 'Ranch not found.' })
    async findOne(@Param('idRanch', ParseIntPipe) idRanch: number): Promise<{ ranch: RanchDetailedDto }> {
        const ranch = await this.ranchesService.findOneById(RanchDetailedDto, idRanch);
        return { ranch };
    }
}
