import { Injectable } from '@nestjs/common';
import { RegisterFatteningEntryDto } from './dto/inputs/register-fattening-entry.dto';
import { UpdateFatteningEntryDto } from './dto/inputs/update-fattening-entry.dto';
import { RegisterFeedRecordDto } from './dto/inputs/register-feed-record.dto';
import { UpdateFeedRecordDto } from './dto/inputs/update-feed-record.dto';
import { FatteningEntryDto } from 'src/modules/fattening-modules/fattening-entries/dto/fattening-entry.dto';
import { FeedRecordDto } from 'src/modules/fattening-modules/feed-records/dto/feed-record.dto';
import { RegisterFatteningEntryUseCase } from './use-cases/register-fattening-entry.use-case';
import { UpdateFatteningEntryUseCase } from './use-cases/update-fattening-entry.use-case';
import { DeleteFatteningEntryUseCase } from './use-cases/delete-fattening-entry.use-case';
import { RegisterFeedRecordUseCase } from './use-cases/register-feed-record.use-case';
import { UpdateFeedRecordUseCase } from './use-cases/update-feed-record.use-case';
import { DeleteFeedRecordUseCase } from './use-cases/delete-feed-record.use-case';

@Injectable()
export class FatteningService {
    constructor(
        private readonly registerFatteningEntryUseCase: RegisterFatteningEntryUseCase,
        private readonly updateFatteningEntryUseCase: UpdateFatteningEntryUseCase,
        private readonly deleteFatteningEntryUseCase: DeleteFatteningEntryUseCase,
        private readonly registerFeedRecordUseCase: RegisterFeedRecordUseCase,
        private readonly updateFeedRecordUseCase: UpdateFeedRecordUseCase,
        private readonly deleteFeedRecordUseCase: DeleteFeedRecordUseCase,
    ) {}

    registerFatteningEntry(dto: RegisterFatteningEntryDto): Promise<FatteningEntryDto> {
        return this.registerFatteningEntryUseCase.execute(dto);
    }

    updateFatteningEntry(id: number, dto: UpdateFatteningEntryDto): Promise<FatteningEntryDto> {
        return this.updateFatteningEntryUseCase.execute(id, dto);
    }

    deleteFatteningEntry(id: number): Promise<void> {
        return this.deleteFatteningEntryUseCase.execute(id);
    }

    registerFeedRecord(dto: RegisterFeedRecordDto): Promise<FeedRecordDto> {
        return this.registerFeedRecordUseCase.execute(dto);
    }

    updateFeedRecord(id: number, dto: UpdateFeedRecordDto): Promise<FeedRecordDto> {
        return this.updateFeedRecordUseCase.execute(id, dto);
    }

    deleteFeedRecord(id: number): Promise<void> {
        return this.deleteFeedRecordUseCase.execute(id);
    }
}
