import { Body, Controller, Delete, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserUp } from 'src/app/auth/decorators';
import { CurrentUser } from 'src/shared/decorators';

import { RegisterFatteningEntryUseCase } from './use-cases/register-fattening-entry.use-case';
import { UpdateFatteningEntryUseCase } from './use-cases/update-fattening-entry.use-case';
import { DeleteFatteningEntryUseCase } from './use-cases/delete-fattening-entry.use-case';
import { RegisterFeedRecordUseCase } from './use-cases/register-feed-record.use-case';
import { UpdateFeedRecordUseCase } from './use-cases/update-feed-record.use-case';
import { DeleteFeedRecordUseCase } from './use-cases/delete-feed-record.use-case';

import { RegisterFatteningEntryDto } from './dto/inputs/register-fattening-entry.dto';
import { UpdateFatteningEntryDto } from './dto/inputs/update-fattening-entry.dto';
import { RegisterFeedRecordDto } from './dto/inputs/register-feed-record.dto';
import { UpdateFeedRecordDto } from './dto/inputs/update-feed-record.dto';

import { FatteningEntryDto } from 'src/modules/fattening-modules/fattening-entries/dto/fattening-entry.dto';
import { FeedRecordDto } from 'src/modules/fattening-modules/feed-records/dto/feed-record.dto';

@ApiTags('Fattening — Engorde')
@ApiBearerAuth('access-token')
@Controller('fattening')
export class FatteningController {
    constructor(
        private readonly registerFatteningEntryUseCase: RegisterFatteningEntryUseCase,
        private readonly updateFatteningEntryUseCase: UpdateFatteningEntryUseCase,
        private readonly deleteFatteningEntryUseCase: DeleteFatteningEntryUseCase,
        private readonly registerFeedRecordUseCase: RegisterFeedRecordUseCase,
        private readonly updateFeedRecordUseCase: UpdateFeedRecordUseCase,
        private readonly deleteFeedRecordUseCase: DeleteFeedRecordUseCase,
    ) {}

    // ── Fattening entry ────────────────────────────────────────

    @Post('entry')
    @UserUp()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Manually register a fattening entry (ps=2 Recría → ps=3 Engorde)' })
    async registerFatteningEntry(
        @Body() dto: RegisterFatteningEntryDto,
        @CurrentUser('id') idUser: number,
    ): Promise<{ fatteningEntry: FatteningEntryDto }> {
        return { fatteningEntry: await this.registerFatteningEntryUseCase.execute(dto, idUser) };
    }

    @Patch('entry/:id')
    @UserUp()
    @ApiOperation({ summary: 'Update a fattening entry' })
    async updateFatteningEntry(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateFatteningEntryDto,
    ): Promise<{ fatteningEntry: FatteningEntryDto }> {
        return { fatteningEntry: await this.updateFatteningEntryUseCase.execute(id, dto) };
    }

    @Delete('entry/:id')
    @UserUp()
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete a fattening entry (reverts the animal to ps=2, clears its lot)' })
    async deleteFatteningEntry(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return this.deleteFatteningEntryUseCase.execute(id);
    }

    // ── Feed record ─────────────────────────────────────────────

    @Post('feed-record')
    @UserUp()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Register feed given to a lot (does not create an animal_event — lot-level, not per-animal)' })
    async registerFeedRecord(
        @Body() dto: RegisterFeedRecordDto,
        @CurrentUser('id') idUser: number,
    ): Promise<{ feedRecord: FeedRecordDto }> {
        return { feedRecord: await this.registerFeedRecordUseCase.execute(dto, idUser) };
    }

    @Patch('feed-record/:id')
    @UserUp()
    @ApiOperation({ summary: 'Update a feed record' })
    async updateFeedRecord(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateFeedRecordDto,
    ): Promise<{ feedRecord: FeedRecordDto }> {
        return { feedRecord: await this.updateFeedRecordUseCase.execute(id, dto) };
    }

    @Delete('feed-record/:id')
    @UserUp()
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete a feed record' })
    async deleteFeedRecord(@Param('id', ParseIntPipe) id: number): Promise<void> {
        return this.deleteFeedRecordUseCase.execute(id);
    }
}
