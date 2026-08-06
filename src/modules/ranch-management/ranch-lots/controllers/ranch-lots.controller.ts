import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { RanchLotsService } from '../services/ranch-lots.service';
import { CreateRanchLotDto } from '../dto/create-ranch-lot.dto';
import { UpdateRanchLotDto } from '../dto/update-ranch-lot.dto';
import { RanchLotDto } from '../dto/ranch-lot.dto';
import { RanchLotDetailedDto } from '../dto/ranch-lot-detailed.dto';
import { UserUp } from 'src/app/auth/decorators';
import { CurrentUser } from 'src/shared/decorators';
import { ApiNotFound, ApiConflict } from 'src/shared/utils/swagger';
import { RanchUsersService } from 'src/modules/ranch-management/ranch-users/services/ranch-users.service';

/**
 * Error dictionary for this module:
 *   RANCH_LOT_NOT_FOUND    404
 *   RANCH_LOT_HAS_ANIMALS  409
 *   RANCH_ACCESS_DENIED    403 — user does not belong to the ranch that owns the lot
 */
@ApiTags('Ranch Lots')
@ApiBearerAuth('access-token')
@Controller('ranch-lots')
export class RanchLotsController {
    constructor(
        private readonly ranchLotsService: RanchLotsService,
        private readonly ranchUsersService: RanchUsersService,
    ) {}

    @Post()
    @UserUp()
    @ApiOperation({ summary: 'Create a ranch lot' })
    @ApiCreatedResponse({ type: RanchLotDto })
    async create(@Body() dto: CreateRanchLotDto, @CurrentUser('id') idUser: number): Promise<RanchLotDto> {
        await this.ranchUsersService.assertMember(idUser, dto.idRanch);
        return await this.ranchLotsService.create(dto);
    }

    @Get('by-ranch/:idRanch')
    @UserUp()
    @ApiOperation({ summary: 'List lots of a ranch' })
    @ApiOkResponse({ type: [RanchLotDto] })
    async findByRanch(@Param('idRanch', ParseIntPipe) idRanch: number, @CurrentUser('id') idUser: number): Promise<RanchLotDto[]> {
        await this.ranchUsersService.assertMember(idUser, idRanch);
        return await this.ranchLotsService.findAllByRanch(idRanch);
    }

    @Get(':id')
    @UserUp()
    @ApiOperation({ summary: 'Get a ranch lot by ID' })
    @ApiOkResponse({ type: RanchLotDetailedDto })
    @ApiNotFound({ code: 'RANCH_LOT_NOT_FOUND', message: 'Ranch lot not found.' })
    async findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') idUser: number): Promise<RanchLotDetailedDto> {
        const lot = await this.ranchLotsService.findOneById(RanchLotDetailedDto, id);
        await this.ranchUsersService.assertMember(idUser, lot.idRanch);
        return lot;
    }

    @Patch(':id')
    @UserUp()
    @ApiOperation({ summary: 'Update a ranch lot' })
    @ApiOkResponse({ type: RanchLotDetailedDto })
    @ApiNotFound({ code: 'RANCH_LOT_NOT_FOUND', message: 'Ranch lot not found.' })
    async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRanchLotDto, @CurrentUser('id') idUser: number): Promise<RanchLotDetailedDto> {
        const existing = await this.ranchLotsService.findOneById(RanchLotDetailedDto, id);
        await this.ranchUsersService.assertMember(idUser, existing.idRanch);
        return await this.ranchLotsService.update(id, dto);
    }

    @Delete(':id')
    @UserUp()
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete a ranch lot' })
    @ApiNotFound({ code: 'RANCH_LOT_NOT_FOUND', message: 'Ranch lot not found.' })
    @ApiConflict({ code: 'RANCH_LOT_HAS_ANIMALS', message: 'Ranch lot still has animals assigned to it.' })
    async remove(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') idUser: number): Promise<void> {
        const existing = await this.ranchLotsService.findOneById(RanchLotDetailedDto, id);
        await this.ranchUsersService.assertMember(idUser, existing.idRanch);
        await this.ranchLotsService.remove(id);
    }
}
