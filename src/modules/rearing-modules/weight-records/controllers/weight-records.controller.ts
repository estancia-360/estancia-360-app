import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { WeightRecordsService } from '../services/weight-records.service';
import { WeightRecordDto } from '../dto/weight-record.dto';
import { PaginationParamsDto, PaginationResponseDto } from 'src/shared/dto';
import { UserUp } from 'src/app/auth/decorators';
import { CurrentUser } from 'src/shared/decorators';
import { ApiNotFound } from 'src/shared/utils/swagger';
import { RanchAnimalsService } from 'src/modules/ranch-management/ranch-animals/services/ranch-animals.service';
import { RanchAnimalPlainDto } from 'src/modules/ranch-management/ranch-animals/dto/ranch-animal-plain.dto';
import { RanchLotsService } from 'src/modules/ranch-management/ranch-lots/services/ranch-lots.service';
import { RanchLotDto } from 'src/modules/ranch-management/ranch-lots/dto/ranch-lot.dto';
import { RanchUsersService } from 'src/modules/ranch-management/ranch-users/services/ranch-users.service';

@ApiTags('Weight Records')
@ApiBearerAuth('access-token')
@Controller('weight-records')
export class WeightRecordsController {
    constructor(
        private readonly weightRecordsService: WeightRecordsService,
        private readonly ranchAnimalsService: RanchAnimalsService,
        private readonly ranchLotsService: RanchLotsService,
        private readonly ranchUsersService: RanchUsersService,
    ) {}

    @Get('animal/:idRanchAnimal')
    @UserUp()
    @ApiOperation({ summary: 'List weight records of an animal in chronological order (ASC) — used to compute ADG' })
    @ApiOkResponse({ description: 'Paginated list of weight records.' })
    async findAllByAnimal(
        @Param('idRanchAnimal', ParseIntPipe) idRanchAnimal: number,
        @Query() pagination: PaginationParamsDto,
        @CurrentUser('id') idUser: number,
    ): Promise<PaginationResponseDto<WeightRecordDto>> {
        const animal = await this.ranchAnimalsService.findOneById(RanchAnimalPlainDto, idRanchAnimal);
        await this.ranchUsersService.assertMember(idUser, animal.idRanch);
        return await this.weightRecordsService.findAllByAnimal(idRanchAnimal, pagination);
    }

    @Get('lot/:idLot')
    @UserUp()
    @ApiOperation({ summary: 'List weight records of a lot, paginated' })
    @ApiOkResponse({ description: 'Paginated list of weight records.' })
    async findAllByLot(
        @Param('idLot', ParseIntPipe) idLot: number,
        @Query() pagination: PaginationParamsDto,
        @CurrentUser('id') idUser: number,
    ): Promise<PaginationResponseDto<WeightRecordDto>> {
        const lot = await this.ranchLotsService.findOneById(RanchLotDto, idLot);
        await this.ranchUsersService.assertMember(idUser, lot.idRanch);
        return await this.weightRecordsService.findAllByLot(idLot, pagination);
    }

    @Get(':id')
    @UserUp()
    @ApiOperation({ summary: 'Get a weight record by ID' })
    @ApiOkResponse({ type: WeightRecordDto })
    @ApiNotFound({ code: 'WEIGHT_RECORD_NOT_FOUND', message: 'Weight record not found.' })
    async findOneById(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') idUser: number): Promise<{ weightRecord: WeightRecordDto }> {
        const weightRecord = await this.weightRecordsService.findOneById(WeightRecordDto, id);
        const animal = await this.ranchAnimalsService.findOneById(RanchAnimalPlainDto, weightRecord.event.idRanchAnimal);
        await this.ranchUsersService.assertMember(idUser, animal.idRanch);
        return { weightRecord };
    }
}
