import { Injectable } from '@nestjs/common';
import { FeedRecordsService } from 'src/modules/fattening-modules/feed-records/services/feed-records.service';
import { FeedRecordDto } from 'src/modules/fattening-modules/feed-records/dto/feed-record.dto';
import { RanchLotsService } from 'src/modules/ranch-management/ranch-lots/services/ranch-lots.service';
import { RanchLotDto } from 'src/modules/ranch-management/ranch-lots/dto/ranch-lot.dto';
import { RanchUsersService } from 'src/modules/ranch-management/ranch-users/services/ranch-users.service';
import { UpdateFeedRecordDto } from '../dto/inputs/update-feed-record.dto';

@Injectable()
export class UpdateFeedRecordUseCase {
    constructor(
        private readonly feedRecordsService: FeedRecordsService,
        private readonly ranchLotsService: RanchLotsService,
        private readonly ranchUsersService: RanchUsersService,
    ) {}

    async execute(id: number, dto: UpdateFeedRecordDto, idUser: number): Promise<FeedRecordDto> {
        const existing = await this.feedRecordsService.findOneById(FeedRecordDto, id, { throwException: true });
        const lot = await this.ranchLotsService.findOneById(RanchLotDto, existing.idLot);
        await this.ranchUsersService.assertMember(idUser, lot.idRanch);

        await this.feedRecordsService.update(id, dto);
        return (await this.feedRecordsService.findOneById(FeedRecordDto, id, { throwException: true }))!;
    }
}
