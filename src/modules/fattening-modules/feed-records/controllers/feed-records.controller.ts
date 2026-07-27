import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FeedRecordsService } from '../services/feed-records.service';
import { FeedRecordDto } from '../dto/feed-record.dto';
import { PaginationParamsDto, PaginationResponseDto } from 'src/shared/dto';
import { UserUp } from 'src/app/auth/decorators';
import { ApiNotFound } from 'src/shared/utils/swagger';

@ApiTags('Feed Records')
@ApiBearerAuth('access-token')
@Controller('feed-records')
export class FeedRecordsController {
    constructor(private readonly feedRecordsService: FeedRecordsService) {}

    @Get('lot/:idLot')
    @UserUp()
    @ApiOperation({ summary: 'List feed records of a lot, paginated' })
    @ApiOkResponse({ description: 'Paginated list of feed records.' })
    async findAllByLot(
        @Param('idLot', ParseIntPipe) idLot: number,
        @Query() pagination: PaginationParamsDto,
    ): Promise<PaginationResponseDto<FeedRecordDto>> {
        return await this.feedRecordsService.findAllByLot(idLot, pagination);
    }

    @Get(':id')
    @UserUp()
    @ApiOperation({ summary: 'Get a feed record by ID' })
    @ApiOkResponse({ type: FeedRecordDto })
    @ApiNotFound({ code: 'FEED_RECORD_NOT_FOUND', message: 'Feed record not found.' })
    async findOneById(@Param('id', ParseIntPipe) id: number): Promise<FeedRecordDto> {
        return await this.feedRecordsService.findOneById(FeedRecordDto, id);
    }
}
