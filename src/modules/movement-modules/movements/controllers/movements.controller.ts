import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { MovementsService } from '../services/movements.service';
import { MovementDto } from '../dto/movement.dto';
import { MovementStatusEnum, MovementTypeEnum } from '../entities/movement.entity';
import { PaginationParamsDto, PaginationResponseDto } from 'src/shared/dto';
import { UserUp } from 'src/app/auth/decorators';
import { ApiNotFound } from 'src/shared/utils/swagger';

@ApiTags('Movements — Query')
@ApiBearerAuth('access-token')
@Controller('movements')
export class MovementsController {
    constructor(private readonly movementsService: MovementsService) {}

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
    ): Promise<PaginationResponseDto<MovementDto>> {
        return await this.movementsService.findAllByRanch(idRanch, pagination, { movementType, status });
    }

    @Get(':id')
    @UserUp()
    @ApiOperation({ summary: 'Get a movement by ID, with its per-animal detail' })
    @ApiOkResponse({ type: MovementDto })
    @ApiNotFound({ code: 'MOVEMENT_NOT_FOUND', message: 'Movement not found.' })
    async findOneById(@Param('id', ParseIntPipe) id: number): Promise<{ movement: MovementDto }> {
        return { movement: await this.movementsService.findOneById(MovementDto, id) };
    }
}
