import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RegisterTreatmentDto } from '../dto/inputs/register-treatment.dto';
import { AnimalEventsService } from 'src/modules/ranch-management/animal-events/services/animal-events.service';
import { RanchAnimalsService } from 'src/modules/ranch-management/ranch-animals/services/ranch-animals.service';
import { TreatmentsService } from 'src/modules/health-modules/treatments/services/treatments.service';
import { TreatmentDto } from 'src/modules/health-modules/treatments/dto/treatment.dto';
import { RanchAnimalPlainDto } from 'src/modules/ranch-management/ranch-animals/dto/ranch-animal-plain.dto';
import { EVENT_TYPE_IDS, PRODUCTIVE_STATUS_IDS } from 'src/shared/constants';

@Injectable()
export class RegisterTreatmentUseCase {
    constructor(
        private readonly dataSource: DataSource,
        private readonly ranchAnimalsService: RanchAnimalsService,
        private readonly animalEventsService: AnimalEventsService,
        private readonly treatmentsService: TreatmentsService,
    ) {}

    async execute(dto: RegisterTreatmentDto, idUser?: number): Promise<TreatmentDto> {
        const animal = await this.ranchAnimalsService.findOneById(RanchAnimalPlainDto, dto.idRanchAnimal);

        if (animal.idProductiveStatus === PRODUCTIVE_STATUS_IDS.BAJA) {
            throw new BadRequestException({
                message: `Animal ID=${dto.idRanchAnimal} is discharged (ps=4) and cannot receive treatments.`,
                error: 'ANIMAL_IS_BAJA',
            });
        }

        const eventDate = new Date(dto.eventDate);

        // RN-18: withdrawal_end_date = event_date + withdrawal_days (computed by the backend).
        let withdrawalEndDate: Date | undefined;
        if (dto.withdrawalDays) {
            withdrawalEndDate = new Date(eventDate);
            withdrawalEndDate.setDate(withdrawalEndDate.getDate() + dto.withdrawalDays);
        }

        return await this.dataSource.transaction(async (manager) => {
            const event = await this.animalEventsService.create(
                {
                    idRanchAnimal: dto.idRanchAnimal,
                    idEventType: EVENT_TYPE_IDS.TREATMENT,
                    idUser,
                    notes: dto.notes,
                    isSynced: dto.isSynced ?? false,
                    eventDate,
                },
                manager,
            );

            const treatment = await this.treatmentsService.create(
                {
                    idEvent: event.id,
                    illness: dto.illness,
                    medication: dto.medication,
                    dose: dto.dose,
                    durationDays: dto.durationDays,
                    withdrawalDays: dto.withdrawalDays,
                    withdrawalEndDate,
                    responsible: dto.responsible,
                    notes: dto.notes,
                },
                manager,
            );

            return (await this.treatmentsService.findOneById(TreatmentDto, treatment.id, { throwException: true }, manager))!;
        });
    }
}
