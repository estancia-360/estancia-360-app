import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { GestationDiagnosesService } from 'src/modules/breeding-modules/gestation-diagnoses/services/gestation-diagnoses.service';
import { ParturitionsService } from 'src/modules/breeding-modules/parturitions/services/parturitions.service';
import { AnimalEventsService } from 'src/modules/ranch-management/animal-events/services/animal-events.service';
import { RanchAnimalsService } from 'src/modules/ranch-management/ranch-animals/services/ranch-animals.service';
import { SyncDeletionsService } from 'src/modules/core/sync-deletions/services/sync-deletions.service';
import { RanchUsersService } from 'src/modules/ranch-management/ranch-users/services/ranch-users.service';
import { GestationDiagnosisDto } from 'src/modules/breeding-modules/gestation-diagnoses/dto/gestation-diagnosis.dto';
import { RanchAnimalPlainDto } from 'src/modules/ranch-management/ranch-animals/dto/ranch-animal-plain.dto';

@Injectable()
export class DeleteGestationDiagnosisUseCase {
    constructor(
        private readonly dataSource: DataSource,
        private readonly gestationDiagnosesService: GestationDiagnosesService,
        private readonly parturitionsService: ParturitionsService,
        private readonly animalEventsService: AnimalEventsService,
        private readonly ranchAnimalsService: RanchAnimalsService,
        private readonly ranchUsersService: RanchUsersService,
        private readonly syncDeletionsService: SyncDeletionsService,
    ) {}

    async execute(id: number, idUser: number): Promise<void> {
        const diagnosis = await this.gestationDiagnosesService.findOneById(GestationDiagnosisDto, id, { throwException: true });
        const diagnosisEventId = diagnosis.idEvent;

        const animal = await this.ranchAnimalsService.findOneById(RanchAnimalPlainDto, diagnosis.event.idRanchAnimal);
        const idRanch = animal.idRanch;
        await this.ranchUsersService.assertMember(idUser, idRanch);

        const parturition = await this.parturitionsService.findOneByDiagnosisId(id);
        let parturitionId: number | undefined;
        let parturitionEventId: number | undefined;
        if (parturition) {
            parturitionId = parturition.id;
            parturitionEventId = parturition.idEvent;
        }

        await this.dataSource.transaction(async (manager) => {
            if (parturitionId !== undefined) {
                await this.parturitionsService.deleteById(parturitionId, manager);
                if (parturitionEventId !== undefined) await this.animalEventsService.deleteById(parturitionEventId, manager);
                await this.syncDeletionsService.log('parturitions', parturitionId, idRanch, manager);
                if (parturitionEventId !== undefined) {
                    await this.syncDeletionsService.log('animal_events', parturitionEventId, idRanch, manager);
                }
            }

            await this.gestationDiagnosesService.deleteById(id, manager);
            await this.animalEventsService.deleteById(diagnosisEventId, manager);
            await this.syncDeletionsService.log('gestation_diagnoses', id, idRanch, manager);
            await this.syncDeletionsService.log('animal_events', diagnosisEventId, idRanch, manager);
        });
    }
}
