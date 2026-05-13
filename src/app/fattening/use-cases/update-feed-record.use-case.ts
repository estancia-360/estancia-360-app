import { Injectable } from '@nestjs/common';
import { FeedRecordsService } from 'src/modules/fattening-modules/feed-records/services/feed-records.service';
import { FeedRecordDto } from 'src/modules/fattening-modules/feed-records/dto/feed-record.dto';
import { UpdateFeedRecordDto } from '../dto/inputs/update-feed-record.dto';

@Injectable()
export class UpdateFeedRecordUseCase {
    constructor(private readonly feedRecordsService: FeedRecordsService) {}

    async execute(id: number, dto: UpdateFeedRecordDto): Promise<FeedRecordDto> {
        await this.feedRecordsService.update(id, dto);
        return (await this.feedRecordsService.findOneById(id, {
            throwException: true,
            template: FeedRecordDto,
        }))!;
    }
}
