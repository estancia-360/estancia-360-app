import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RegisterWeightRecordDto } from '../dto/inputs/register-weight-record.dto';
import { AnimalEventsService } from 'src/modules/ranch-management/animal-events/services/animal-events.service';
import { RanchAnimalsService } from 'src/modules/ranch-management/ranch-animals/services/ranch-animals.service';
import { WeightRecordsService } from 'src/modules/rearing-modules/weight-records/services/weight-records.service';
import { WeightRecordDto } from 'src/modules/rearing-modules/weight-records/dto/weight-record.dto';
import { RanchAnimalPlainDto } from 'src/modules/ranch-management/ranch-animals/dto/ranch-animal-plain.dto';
import { EVENT_TYPE_IDS } from 'src/app/breeding/constants/event-type-ids.constant';
import { PRODUCTIVE_STATUS_IDS } from 'src/app/breeding/constants/productive-status-ids.constant';
import { RanchAnimal } from 'src/modules/ranch-management/ranch-animals/entities/ranch-animal.entity';
import { MyBadRequestException } from 'src/shared/exceptions';

@Injectable()
export class RegisterWeightRecordUseCase {
    constructor(
        private readonly dataSource: DataSource,
        private readonly ranchAnimalsService: RanchAnimalsService,
        private readonly animalEventsService: AnimalEventsService,
        private readonly weightRecordsService: WeightRecordsService,
    ) {}

    async execute(dto: RegisterWeightRecordDto): Promise<WeightRecordDto> {
        const animal = await this.ranchAnimalsService.findOneById(dto.idRanchAnimal, {
            throwException: true,
            template: RanchAnimalPlainDto,
        });

        // RN-02: animal dado de baja no puede recibir eventos
        if (animal!.idProductiveStatus === PRODUCTIVE_STATUS_IDS.BAJA) {
            throw new MyBadRequestException(
                `El animal ID=${dto.idRanchAnimal} está dado de baja (ps=4) y no puede recibir pesajes.`,
                'ANIMAL_IS_BAJA',
            );
        }

        return await this.dataSource.transaction(async (manager) => {
            const event = await this.animalEventsService.create({
                idRanchAnimal: dto.idRanchAnimal,
                idEventType: EVENT_TYPE_IDS.WEIGHT_RECORD,
                notes: dto.notes,
                isSynced: dto.isSynced ?? false,
                eventDate: new Date(dto.eventDate),
            }, manager);

            const record = await this.weightRecordsService.create({
                idEvent: event.id,
                idLot: dto.idLot,
                localId: dto.localId,
                weight: dto.weight,
                weightType: dto.weightType,
                bodyCondition: dto.bodyCondition,
                ageDays: dto.ageDays,
                notes: dto.notes,
            }, manager);

            await manager.getRepository(RanchAnimal).update(
                { id: dto.idRanchAnimal },
                { weight: dto.weight, updatedAt: new Date() },
            );

            return (await this.weightRecordsService.findOneById(
                record.id,
                { throwException: true, template: WeightRecordDto },
                manager,
            ))!;
        });
    }
}
