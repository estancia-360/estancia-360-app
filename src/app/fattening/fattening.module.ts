import { Module } from '@nestjs/common';
import { FatteningService } from './fattening.service';
import { FatteningController } from './fattening.controller';
import { RegisterFatteningEntryUseCase } from './use-cases/register-fattening-entry.use-case';
import { UpdateFatteningEntryUseCase } from './use-cases/update-fattening-entry.use-case';
import { DeleteFatteningEntryUseCase } from './use-cases/delete-fattening-entry.use-case';
import { RegisterFeedRecordUseCase } from './use-cases/register-feed-record.use-case';
import { UpdateFeedRecordUseCase } from './use-cases/update-feed-record.use-case';
import { DeleteFeedRecordUseCase } from './use-cases/delete-feed-record.use-case';
import { RanchAnimalsModule } from 'src/modules/ranch-management/ranch-animals/ranch-animals.module';
import { AnimalEventsModule } from 'src/modules/ranch-management/animal-events/animal-events.module';
import { FatteningEntriesModule } from 'src/modules/fattening-modules/fattening-entries/fattening-entries.module';
import { FeedRecordsModule } from 'src/modules/fattening-modules/feed-records/feed-records.module';
import { RanchLotsModule } from 'src/modules/ranch-management/ranch-lots/ranch-lots.module';
import { SyncDeletionsModule } from 'src/modules/core/sync-deletions/sync-deletions.module';

@Module({
    imports: [
        RanchAnimalsModule,
        AnimalEventsModule,
        FatteningEntriesModule,
        FeedRecordsModule,
        RanchLotsModule,
        SyncDeletionsModule,
    ],
    controllers: [FatteningController],
    providers: [
        FatteningService,
        RegisterFatteningEntryUseCase,
        UpdateFatteningEntryUseCase,
        DeleteFatteningEntryUseCase,
        RegisterFeedRecordUseCase,
        UpdateFeedRecordUseCase,
        DeleteFeedRecordUseCase,
    ],
    exports: [
        RegisterFatteningEntryUseCase,
        UpdateFatteningEntryUseCase,
        DeleteFatteningEntryUseCase,
        RegisterFeedRecordUseCase,
        UpdateFeedRecordUseCase,
        DeleteFeedRecordUseCase,
    ],
})
export class FatteningModule {}
