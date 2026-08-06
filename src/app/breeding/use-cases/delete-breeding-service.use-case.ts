import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BreedingServicesService } from 'src/modules/breeding-modules/breeding-services/services/breeding-services.service';
import { GestationDiagnosesService } from 'src/modules/breeding-modules/gestation-diagnoses/services/gestation-diagnoses.service';
import { ParturitionsService } from 'src/modules/breeding-modules/parturitions/services/parturitions.service';
import { AnimalEventsService } from 'src/modules/ranch-management/animal-events/services/animal-events.service';
import { RanchAnimalsService } from 'src/modules/ranch-management/ranch-animals/services/ranch-animals.service';
import { SyncDeletionsService } from 'src/modules/core/sync-deletions/services/sync-deletions.service';
import { RanchUsersService } from 'src/modules/ranch-management/ranch-users/services/ranch-users.service';
import { BreedingServiceDto } from 'src/modules/breeding-modules/breeding-services/dto/breeding-service.dto';
import { RanchAnimalPlainDto } from 'src/modules/ranch-management/ranch-animals/dto/ranch-animal-plain.dto';

@Injectable()
export class DeleteBreedingServiceUseCase {
    constructor(
        private readonly dataSource: DataSource,
        private readonly breedingServicesService: BreedingServicesService,
        private readonly gestationDiagnosesService: GestationDiagnosesService,
        private readonly parturitionsService: ParturitionsService,
        private readonly animalEventsService: AnimalEventsService,
        private readonly ranchAnimalsService: RanchAnimalsService,
        private readonly ranchUsersService: RanchUsersService,
        private readonly syncDeletionsService: SyncDeletionsService,
    ) {}

    /**
     * Deletes a breeding service and everything that cascades from it:
     *   BreedingService → GestationDiagnosis → Parturition
     * Deletion order is the reverse of creation order to respect FKs.
     */
    async execute(id: number, idUser: number): Promise<void> {
        const service = await this.breedingServicesService.findOneById(BreedingServiceDto, id, { throwException: true });
        const serviceEventId = service.idEvent;

        const animal = await this.ranchAnimalsService.findOneById(RanchAnimalPlainDto, service.event.idRanchAnimal);
        const idRanch = animal.idRanch;
        await this.ranchUsersService.assertMember(idUser, idRanch);

        const diagnosis = await this.gestationDiagnosesService.findOneByServiceId(id);
        let diagnosisId: number | undefined;
        let diagnosisEventId: number | undefined;
        let parturitionId: number | undefined;
        let parturitionEventId: number | undefined;

        if (diagnosis) {
            diagnosisId = diagnosis.id;
            diagnosisEventId = diagnosis.idEvent;
            const parturition = await this.parturitionsService.findOneByDiagnosisId(diagnosis.id);
            if (parturition) {
                parturitionId = parturition.id;
                parturitionEventId = parturition.idEvent;
            }
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

            if (diagnosisId !== undefined) {
                await this.gestationDiagnosesService.deleteById(diagnosisId, manager);
                if (diagnosisEventId !== undefined) await this.animalEventsService.deleteById(diagnosisEventId, manager);
                await this.syncDeletionsService.log('gestation_diagnoses', diagnosisId, idRanch, manager);
                if (diagnosisEventId !== undefined) {
                    await this.syncDeletionsService.log('animal_events', diagnosisEventId, idRanch, manager);
                }
            }

            await this.breedingServicesService.deleteById(id, manager);
            await this.animalEventsService.deleteById(serviceEventId, manager);
            await this.syncDeletionsService.log('breeding_services', id, idRanch, manager);
            await this.syncDeletionsService.log('animal_events', serviceEventId, idRanch, manager);
        });
    }
}
