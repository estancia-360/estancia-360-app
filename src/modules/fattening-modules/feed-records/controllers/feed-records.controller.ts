import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FeedRecordsService } from '../services/feed-records.service';
import { FeedRecordDto } from '../dto/feed-record.dto';
import { PaginationParamsDto, PaginationResponseDto } from 'src/shared/dto';
import { UserUp } from 'src/app/auth/decorators';
import { CurrentUser } from 'src/shared/decorators';
import { ApiNotFound } from 'src/shared/utils/swagger';
import { RanchLotsService } from 'src/modules/ranch-management/ranch-lots/services/ranch-lots.service';
import { RanchLotDto } from 'src/modules/ranch-management/ranch-lots/dto/ranch-lot.dto';
import { RanchUsersService } from 'src/modules/ranch-management/ranch-users/services/ranch-users.service';

@ApiTags('Feed Records')
@ApiBearerAuth('access-token')
@Controller('feed-records')
export class FeedRecordsController {
    constructor(
        private readonly feedRecordsService: FeedRecordsService,
        private readonly ranchLotsService: RanchLotsService,
        private readonly ranchUsersService: RanchUsersService,
    ) {}

    @Get('lot/:idLot')
    @UserUp()
    @ApiOperation({ summary: 'List feed records of a lot, paginated' })
    @ApiOkResponse({ description: 'Paginated list of feed records.' })
    async findAllByLot(
        @Param('idLot', ParseIntPipe) idLot: number,
        @Query() pagination: PaginationParamsDto,
        @CurrentUser('id') idUser: number,
    ): Promise<PaginationResponseDto<FeedRecordDto>> {
        const lot = await this.ranchLotsService.findOneById(RanchLotDto, idLot);
        await this.ranchUsersService.assertMember(idUser, lot.idRanch);
        return await this.feedRecordsService.findAllByLot(idLot, pagination);
    }

    @Get(':id')
    @UserUp()
    @ApiOperation({ summary: 'Get a feed record by ID' })
    @ApiOkResponse({ type: FeedRecordDto })
    @ApiNotFound({ code: 'FEED_RECORD_NOT_FOUND', message: 'Feed record not found.' })
    async findOneById(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') idUser: number): Promise<{ feedRecord: FeedRecordDto }> {
        const feedRecord = await this.feedRecordsService.findOneById(FeedRecordDto, id);
        const lot = await this.ranchLotsService.findOneById(RanchLotDto, feedRecord.idLot);
        await this.ranchUsersService.assertMember(idUser, lot.idRanch);
        return { feedRecord };
    }
}
