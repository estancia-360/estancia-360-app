import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { RanchLotsService } from '../services/ranch-lots.service';
import { CreateRanchLotDto } from '../dto/create-ranch-lot.dto';
import { UpdateRanchLotDto } from '../dto/update-ranch-lot.dto';
import { RanchLotDto } from '../dto/ranch-lot.dto';
import { RanchLotDetailedDto } from '../dto/ranch-lot-detailed.dto';
import { UserUp } from 'src/app/auth/decorators';
import { ApiNotFound } from 'src/shared/utils/swagger';

/**
 * Error dictionary for this module:
 *   RANCH_LOT_NOT_FOUND   404
 */
@ApiTags('Ranch Lots')
@ApiBearerAuth('access-token')
@Controller('ranch-lots')
export class RanchLotsController {
    constructor(private readonly ranchLotsService: RanchLotsService) {}

    @Post()
    @UserUp()
    @ApiOperation({ summary: 'Create a ranch lot' })
    @ApiCreatedResponse({ type: RanchLotDto })
    async create(@Body() dto: CreateRanchLotDto): Promise<RanchLotDto> {
        return await this.ranchLotsService.create(dto);
    }

    @Get('by-ranch/:idRanch')
    @UserUp()
    @ApiOperation({ summary: 'List lots of a ranch' })
    @ApiOkResponse({ type: [RanchLotDto] })
    async findByRanch(@Param('idRanch', ParseIntPipe) idRanch: number): Promise<RanchLotDto[]> {
        return await this.ranchLotsService.findAllByRanch(idRanch);
    }

    @Get(':id')
    @UserUp()
    @ApiOperation({ summary: 'Get a ranch lot by ID' })
    @ApiOkResponse({ type: RanchLotDetailedDto })
    @ApiNotFound({ code: 'RANCH_LOT_NOT_FOUND', message: 'Ranch lot not found.' })
    async findOne(@Param('id', ParseIntPipe) id: number): Promise<RanchLotDetailedDto> {
        return await this.ranchLotsService.findOneById(RanchLotDetailedDto, id);
    }

    @Patch(':id')
    @UserUp()
    @ApiOperation({ summary: 'Update a ranch lot' })
    @ApiOkResponse({ type: RanchLotDetailedDto })
    @ApiNotFound({ code: 'RANCH_LOT_NOT_FOUND', message: 'Ranch lot not found.' })
    async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRanchLotDto): Promise<RanchLotDetailedDto> {
        return await this.ranchLotsService.update(id, dto);
    }

    @Delete(':id')
    @UserUp()
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete a ranch lot' })
    @ApiNotFound({ code: 'RANCH_LOT_NOT_FOUND', message: 'Ranch lot not found.' })
    async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
        await this.ranchLotsService.remove(id);
    }
}
