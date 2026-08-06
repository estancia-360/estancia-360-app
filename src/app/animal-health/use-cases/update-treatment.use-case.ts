import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UpdateTreatmentDto } from '../dto/inputs/update-treatment.dto';
import { TreatmentsService } from 'src/modules/health-modules/treatments/services/treatments.service';
import { RanchAnimalsService } from 'src/modules/ranch-management/ranch-animals/services/ranch-animals.service';
import { RanchUsersService } from 'src/modules/ranch-management/ranch-users/services/ranch-users.service';
import { TreatmentDto } from 'src/modules/health-modules/treatments/dto/treatment.dto';
import { RanchAnimalPlainDto } from 'src/modules/ranch-management/ranch-animals/dto/ranch-animal-plain.dto';
import { addDaysToDateOnlyString } from 'src/shared/utils';

@Injectable()
export class UpdateTreatmentUseCase {
    constructor(
        private readonly dataSource: DataSource,
        private readonly treatmentsService: TreatmentsService,
        private readonly ranchAnimalsService: RanchAnimalsService,
        private readonly ranchUsersService: RanchUsersService,
    ) {}

    async execute(id: number, dto: UpdateTreatmentDto, idUser: number): Promise<TreatmentDto> {
        return await this.dataSource.transaction(async (manager) => {
            const existing = await this.treatmentsService.findOneById(TreatmentDto, id, { throwException: true }, manager);
            const animal = await this.ranchAnimalsService.findOneById(RanchAnimalPlainDto, existing.event.idRanchAnimal);
            await this.ranchUsersService.assertMember(idUser, animal.idRanch);

            // RN-18: if withdrawalDays changes, recompute withdrawal_end_date from the
            // treatment's ORIGINAL eventDate (which never changes on update).
            let withdrawalEndDate: Date | undefined;
            if (dto.withdrawalDays !== undefined) {
                withdrawalEndDate = addDaysToDateOnlyString(existing.event.eventDate, dto.withdrawalDays);
            }

            await this.treatmentsService.update(
                id,
                {
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

            return (await this.treatmentsService.findOneById(TreatmentDto, id, { throwException: true }, manager))!;
        });
    }
}
