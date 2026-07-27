import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { WeightRecordsService } from '../services/weight-records.service';
import { WeightRecordDto } from '../dto/weight-record.dto';
import { PaginationParamsDto, PaginationResponseDto } from 'src/shared/dto';
import { UserUp } from 'src/app/auth/decorators';
import { ApiNotFound } from 'src/shared/utils/swagger';

@ApiTags('Weight Records')
@ApiBearerAuth('access-token')
@Controller('weight-records')
export class WeightRecordsController {
    constructor(private readonly weightRecordsService: WeightRecordsService) {}

    @Get('animal/:idRanchAnimal')
    @UserUp()
    @ApiOperation({ summary: 'List weight records of an animal in chronological order (ASC) — used to compute ADG' })
    @ApiOkResponse({ description: 'Paginated list of weight records.' })
    async findAllByAnimal(
        @Param('idRanchAnimal', ParseIntPipe) idRanchAnimal: number,
        @Query() pagination: PaginationParamsDto,
    ): Promise<PaginationResponseDto<WeightRecordDto>> {
        return await this.weightRecordsService.findAllByAnimal(idRanchAnimal, pagination);
    }

    @Get('lot/:idLot')
    @UserUp()
    @ApiOperation({ summary: 'List weight records of a lot, paginated' })
    @ApiOkResponse({ description: 'Paginated list of weight records.' })
    async findAllByLot(
        @Param('idLot', ParseIntPipe) idLot: number,
        @Query() pagination: PaginationParamsDto,
    ): Promise<PaginationResponseDto<WeightRecordDto>> {
        return await this.weightRecordsService.findAllByLot(idLot, pagination);
    }

    @Get(':id')
    @UserUp()
    @ApiOperation({ summary: 'Get a weight record by ID' })
    @ApiOkResponse({ type: WeightRecordDto })
    @ApiNotFound({ code: 'WEIGHT_RECORD_NOT_FOUND', message: 'Weight record not found.' })
    async findOneById(@Param('id', ParseIntPipe) id: number): Promise<{ weightRecord: WeightRecordDto }> {
        return { weightRecord: await this.weightRecordsService.findOneById(WeightRecordDto, id) };
    }
}
