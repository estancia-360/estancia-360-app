import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { FeedRecordsService } from 'src/modules/fattening-modules/feed-records/services/feed-records.service';
import { FeedRecordDto } from 'src/modules/fattening-modules/feed-records/dto/feed-record.dto';
import { RanchLotsService } from 'src/modules/ranch-management/ranch-lots/services/ranch-lots.service';
import { RanchLotDto } from 'src/modules/ranch-management/ranch-lots/dto/ranch-lot.dto';
import { SyncDeletionsService } from 'src/modules/core/sync-deletions/services/sync-deletions.service';

@Injectable()
export class DeleteFeedRecordUseCase {
    constructor(
        private readonly dataSource: DataSource,
        private readonly feedRecordsService: FeedRecordsService,
        private readonly ranchLotsService: RanchLotsService,
        private readonly syncDeletionsService: SyncDeletionsService,
    ) {}

    async execute(id: number): Promise<void> {
        const record = await this.feedRecordsService.findOneById(FeedRecordDto, id, { throwException: true });
        const lot = await this.ranchLotsService.findOneById(RanchLotDto, record.idLot);
        const idRanch = lot.idRanch;

        await this.dataSource.transaction(async (manager) => {
            await this.feedRecordsService.deleteById(id, manager);
            await this.syncDeletionsService.log('feed_records', id, idRanch, manager);
        });
    }
}
