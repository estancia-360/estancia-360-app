import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { MovementsService } from '../services/movements.service';
import { MovementDto } from '../dto/movement.dto';
import { MovementStatusEnum, MovementTypeEnum } from '../entities/movement.entity';
import { PaginationParamsDto, PaginationResponseDto } from 'src/shared/dto';
import { UserUp } from 'src/app/auth/decorators';
import { CurrentUser } from 'src/shared/decorators';
import { ApiNotFound } from 'src/shared/utils/swagger';
import { RanchUsersService } from 'src/modules/ranch-management/ranch-users/services/ranch-users.service';

@ApiTags('Movements — Query')
@ApiBearerAuth('access-token')
@Controller('movements')
export class MovementsController {
    constructor(
        private readonly movementsService: MovementsService,
        private readonly ranchUsersService: RanchUsersService,
    ) {}

    @Get('ranch/:idRanch')
    @UserUp()
    @ApiOperation({ summary: 'List movements of a ranch, paginated' })
    @ApiQuery({ name: 'movementType', required: false, enum: MovementTypeEnum })
    @ApiQuery({ name: 'status', required: false, enum: MovementStatusEnum })
    @ApiOkResponse({ description: 'Paginated list of movements.' })
    async findAllByRanch(
        @Param('idRanch', ParseIntPipe) idRanch: number,
        @Query() pagination: PaginationParamsDto,
        @Query('movementType') movementType: MovementTypeEnum | undefined,
        @Query('status') status: MovementStatusEnum | undefined,
        @CurrentUser('id') idUser: number,
    ): Promise<PaginationResponseDto<MovementDto>> {
        await this.ranchUsersService.assertMember(idUser, idRanch);
        return await this.movementsService.findAllByRanch(idRanch, pagination, { movementType, status });
    }

    @Get(':id')
    @UserUp()
    @ApiOperation({ summary: 'Get a movement by ID, with its per-animal detail' })
    @ApiOkResponse({ type: MovementDto })
    @ApiNotFound({ code: 'MOVEMENT_NOT_FOUND', message: 'Movement not found.' })
    async findOneById(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') idUser: number): Promise<{ movement: MovementDto }> {
        const movement = await this.movementsService.findOneById(MovementDto, id);
        await this.ranchUsersService.assertMember(idUser, movement.idRanch);
        return { movement };
    }
}
