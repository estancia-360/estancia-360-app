import { Injectable } from '@nestjs/common';
import { FeedRecordsService } from 'src/modules/fattening-modules/feed-records/services/feed-records.service';
import { FeedRecordDto } from 'src/modules/fattening-modules/feed-records/dto/feed-record.dto';
import { RegisterFeedRecordDto } from '../dto/inputs/register-feed-record.dto';

@Injectable()
export class RegisterFeedRecordUseCase {
    constructor(private readonly feedRecordsService: FeedRecordsService) {}

    /** No transaction needed — feed_records is the one table that doesn't go through animal_events. */
    async execute(dto: RegisterFeedRecordDto, idUser?: number): Promise<FeedRecordDto> {
        const record = await this.feedRecordsService.create({
            idLot: dto.idLot,
            idUser: dto.idUser ?? idUser,
            localId: dto.localId,
            feedDate: new Date(dto.feedDate),
            feedType: dto.feedType,
            quantity: dto.quantity,
            unit: dto.unit,
            cost: dto.cost,
            notes: dto.notes,
            isSynced: dto.isSynced ?? false,
        });
        return (await this.feedRecordsService.findOneById(FeedRecordDto, record.id, { throwException: true }))!;
    }
}
