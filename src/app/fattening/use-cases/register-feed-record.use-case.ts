import { Injectable } from '@nestjs/common';
import { FeedRecordsService } from 'src/modules/fattening-modules/feed-records/services/feed-records.service';
import { FeedRecordDto } from 'src/modules/fattening-modules/feed-records/dto/feed-record.dto';
import { RanchLotsService } from 'src/modules/ranch-management/ranch-lots/services/ranch-lots.service';
import { RanchLotDto } from 'src/modules/ranch-management/ranch-lots/dto/ranch-lot.dto';
import { RanchUsersService } from 'src/modules/ranch-management/ranch-users/services/ranch-users.service';
import { RegisterFeedRecordDto } from '../dto/inputs/register-feed-record.dto';

@Injectable()
export class RegisterFeedRecordUseCase {
    constructor(
        private readonly feedRecordsService: FeedRecordsService,
        private readonly ranchLotsService: RanchLotsService,
        private readonly ranchUsersService: RanchUsersService,
    ) {}

    /** No transaction needed — feed_records is the one table that doesn't go through animal_events. */
    async execute(dto: RegisterFeedRecordDto, idUser: number): Promise<FeedRecordDto> {
        const lot = await this.ranchLotsService.findOneById(RanchLotDto, dto.idLot);
        await this.ranchUsersService.assertMember(idUser, lot.idRanch);

        const record = await this.feedRecordsService.create({
            idLot: dto.idLot,
            idUser,
            localId: dto.localId,
            // dto.feedDate es un string YYYY-MM-DD (fecha sin hora) — pasarlo por
            // new Date() lo interpreta como medianoche UTC, y el driver de pg
            // serializa columnas `date` con los componentes LOCALES del Date,
            // corriendo el valor un día para atrás en cualquier timezone detrás
            // de UTC. Igual que ranch_animals.birthdate: pasar el string tal cual.
            feedDate: dto.feedDate,
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
