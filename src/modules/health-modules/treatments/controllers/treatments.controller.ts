import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TreatmentsService } from '../services/treatments.service';
import { TreatmentDto } from '../dto/treatment.dto';
import { PaginationParamsDto, PaginationResponseDto } from 'src/shared/dto';
import { UserUp } from 'src/app/auth/decorators';
import { ApiNotFound } from 'src/shared/utils/swagger';

@ApiTags('Treatments')
@ApiBearerAuth('access-token')
@Controller('treatments')
export class TreatmentsController {
    constructor(private readonly treatmentsService: TreatmentsService) {}

    @Get('animal/:idRanchAnimal')
    @UserUp()
    @ApiOperation({ summary: 'List treatments of an animal, paginated' })
    @ApiOkResponse({ description: 'Paginated list of treatments.' })
    async findAllByAnimal(
        @Param('idRanchAnimal', ParseIntPipe) idRanchAnimal: number,
        @Query() pagination: PaginationParamsDto,
    ): Promise<PaginationResponseDto<TreatmentDto>> {
        return await this.treatmentsService.findAllByAnimal(idRanchAnimal, pagination);
    }

    @Get(':id')
    @UserUp()
    @ApiOperation({ summary: 'Get a treatment by ID' })
    @ApiOkResponse({ type: TreatmentDto })
    @ApiNotFound({ code: 'TREATMENT_NOT_FOUND', message: 'Treatment not found.' })
    async findOneById(@Param('id', ParseIntPipe) id: number): Promise<{ treatment: TreatmentDto }> {
        return { treatment: await this.treatmentsService.findOneById(TreatmentDto, id) };
    }
}
