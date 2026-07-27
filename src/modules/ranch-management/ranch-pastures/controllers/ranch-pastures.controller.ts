import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { RanchPasturesService } from '../services/ranch-pastures.service';
import { CreateRanchPastureDto } from '../dto/create-ranch-pasture.dto';
import { UpdateRanchPastureDto } from '../dto/update-ranch-pasture.dto';
import { RanchPastureDto } from '../dto/ranch-pasture.dto';
import { RanchPastureDetailedDto } from '../dto/ranch-pasture-detailed.dto';
import { UserUp } from 'src/app/auth/decorators';
import { ApiNotFound } from 'src/shared/utils/swagger';

/**
 * Error dictionary for this module:
 *   RANCH_PASTURE_NOT_FOUND   404
 */
@ApiTags('Ranch Pastures')
@ApiBearerAuth('access-token')
@Controller('ranch-pastures')
export class RanchPasturesController {
    constructor(private readonly ranchPasturesService: RanchPasturesService) {}

    @Post()
    @UserUp()
    @ApiOperation({ summary: 'Create a ranch pasture' })
    @ApiCreatedResponse({ type: RanchPastureDto })
    async create(@Body() dto: CreateRanchPastureDto): Promise<RanchPastureDto> {
        return await this.ranchPasturesService.create(dto);
    }

    @Get('by-ranch/:idRanch')
    @UserUp()
    @ApiOperation({ summary: 'List pastures of a ranch' })
    @ApiOkResponse({ type: [RanchPastureDto] })
    async findByRanch(@Param('idRanch', ParseIntPipe) idRanch: number): Promise<RanchPastureDto[]> {
        return await this.ranchPasturesService.findAllByRanch(idRanch);
    }

    @Get(':id')
    @UserUp()
    @ApiOperation({ summary: 'Get a ranch pasture by ID' })
    @ApiOkResponse({ type: RanchPastureDetailedDto })
    @ApiNotFound({ code: 'RANCH_PASTURE_NOT_FOUND', message: 'Ranch pasture not found.' })
    async findOne(@Param('id', ParseIntPipe) id: number): Promise<RanchPastureDetailedDto> {
        return await this.ranchPasturesService.findOneById(RanchPastureDetailedDto, id);
    }

    @Patch(':id')
    @UserUp()
    @ApiOperation({ summary: 'Update a ranch pasture' })
    @ApiOkResponse({ type: RanchPastureDetailedDto })
    @ApiNotFound({ code: 'RANCH_PASTURE_NOT_FOUND', message: 'Ranch pasture not found.' })
    async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRanchPastureDto): Promise<RanchPastureDetailedDto> {
        return await this.ranchPasturesService.update(id, dto);
    }

    @Delete(':id')
    @UserUp()
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete a ranch pasture' })
    @ApiNotFound({ code: 'RANCH_PASTURE_NOT_FOUND', message: 'Ranch pasture not found.' })
    async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
        await this.ranchPasturesService.remove(id);
    }
}
