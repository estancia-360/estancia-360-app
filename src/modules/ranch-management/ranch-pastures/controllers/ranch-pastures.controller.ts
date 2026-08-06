import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { RanchPasturesService } from '../services/ranch-pastures.service';
import { CreateRanchPastureDto } from '../dto/create-ranch-pasture.dto';
import { UpdateRanchPastureDto } from '../dto/update-ranch-pasture.dto';
import { RanchPastureDto } from '../dto/ranch-pasture.dto';
import { RanchPastureDetailedDto } from '../dto/ranch-pasture-detailed.dto';
import { UserUp } from 'src/app/auth/decorators';
import { CurrentUser } from 'src/shared/decorators';
import { ApiNotFound, ApiConflict } from 'src/shared/utils/swagger';
import { RanchUsersService } from 'src/modules/ranch-management/ranch-users/services/ranch-users.service';

/**
 * Error dictionary for this module:
 *   RANCH_PASTURE_NOT_FOUND   404
 *   RANCH_PASTURE_HAS_LOTS    409
 *   RANCH_ACCESS_DENIED       403 — user does not belong to the ranch that owns the pasture
 */
@ApiTags('Ranch Pastures')
@ApiBearerAuth('access-token')
@Controller('ranch-pastures')
export class RanchPasturesController {
    constructor(
        private readonly ranchPasturesService: RanchPasturesService,
        private readonly ranchUsersService: RanchUsersService,
    ) {}

    @Post()
    @UserUp()
    @ApiOperation({ summary: 'Create a ranch pasture' })
    @ApiCreatedResponse({ type: RanchPastureDto })
    async create(@Body() dto: CreateRanchPastureDto, @CurrentUser('id') idUser: number): Promise<RanchPastureDto> {
        await this.ranchUsersService.assertMember(idUser, dto.idRanch);
        return await this.ranchPasturesService.create(dto);
    }

    @Get('by-ranch/:idRanch')
    @UserUp()
    @ApiOperation({ summary: 'List pastures of a ranch' })
    @ApiOkResponse({ type: [RanchPastureDto] })
    async findByRanch(@Param('idRanch', ParseIntPipe) idRanch: number, @CurrentUser('id') idUser: number): Promise<RanchPastureDto[]> {
        await this.ranchUsersService.assertMember(idUser, idRanch);
        return await this.ranchPasturesService.findAllByRanch(idRanch);
    }

    @Get(':id')
    @UserUp()
    @ApiOperation({ summary: 'Get a ranch pasture by ID' })
    @ApiOkResponse({ type: RanchPastureDetailedDto })
    @ApiNotFound({ code: 'RANCH_PASTURE_NOT_FOUND', message: 'Ranch pasture not found.' })
    async findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') idUser: number): Promise<RanchPastureDetailedDto> {
        const pasture = await this.ranchPasturesService.findOneById(RanchPastureDetailedDto, id);
        await this.ranchUsersService.assertMember(idUser, pasture.idRanch);
        return pasture;
    }

    @Patch(':id')
    @UserUp()
    @ApiOperation({ summary: 'Update a ranch pasture' })
    @ApiOkResponse({ type: RanchPastureDetailedDto })
    @ApiNotFound({ code: 'RANCH_PASTURE_NOT_FOUND', message: 'Ranch pasture not found.' })
    async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRanchPastureDto, @CurrentUser('id') idUser: number): Promise<RanchPastureDetailedDto> {
        const existing = await this.ranchPasturesService.findOneById(RanchPastureDetailedDto, id);
        await this.ranchUsersService.assertMember(idUser, existing.idRanch);
        return await this.ranchPasturesService.update(id, dto);
    }

    @Delete(':id')
    @UserUp()
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete a ranch pasture' })
    @ApiNotFound({ code: 'RANCH_PASTURE_NOT_FOUND', message: 'Ranch pasture not found.' })
    @ApiConflict({ code: 'RANCH_PASTURE_HAS_LOTS', message: 'Ranch pasture still has lots assigned to it.' })
    async remove(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') idUser: number): Promise<void> {
        const existing = await this.ranchPasturesService.findOneById(RanchPastureDetailedDto, id);
        await this.ranchUsersService.assertMember(idUser, existing.idRanch);
        await this.ranchPasturesService.remove(id);
    }
}
