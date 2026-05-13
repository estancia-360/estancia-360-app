import { Injectable } from '@nestjs/common';
import { FeedRecordsService } from 'src/modules/fattening-modules/feed-records/services/feed-records.service';

@Injectable()
export class DeleteFeedRecordUseCase {
    constructor(private readonly feedRecordsService: FeedRecordsService) {}

    async execute(id: number): Promise<void> {
        await this.feedRecordsService.deleteById(id);
    }
}
