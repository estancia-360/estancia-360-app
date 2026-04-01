import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BreedingServicesService } from 'src/modules/breeding-modules/breeding-services/services/breeding-services.service';
import { GestationDiagnosesService } from 'src/modules/breeding-modules/gestation-diagnoses/services/gestation-diagnoses.service';
import { ParturitionsService } from 'src/modules/breeding-modules/parturitions/services/parturitions.service';
import { AnimalEventsService } from 'src/modules/ranch-management/animal-events/services/animal-events.service';
import { BreedingServiceDto } from 'src/modules/breeding-modules/breeding-services/dto/breeding-service.dto';
import { GestationDiagnosisDto } from 'src/modules/breeding-modules/gestation-diagnoses/dto/gestation-diagnosis.dto';
import { ParturitionDto } from 'src/modules/breeding-modules/parturitions/dto/parturition.dto';

@Injectable()
export class DeleteBreedingServiceUseCase {
    constructor(
        private readonly dataSource: DataSource,
        private readonly breedingServicesService: BreedingServicesService,
        private readonly gestationDiagnosesService: GestationDiagnosesService,
        private readonly parturitionsService: ParturitionsService,
        private readonly animalEventsService: AnimalEventsService,
    ) {}

    /**
     * Elimina un servicio de monta y todos sus registros dependientes en cascada:
     *   BreedingService → GestationDiagnosis → Parturition
     * También elimina los AnimalEvents asociados a cada nivel eliminado.
     *
     * Orden de eliminación (inverso al de creación para respetar FKs):
     *  1. Parturition + su AnimalEvent
     *  2. GestationDiagnosis + su AnimalEvent
     *  3. BreedingService + su AnimalEvent
     */
    async execute(id: number): Promise<void> {
        // Pre-transaction: recopilar los IDs de eventos a eliminar
        const service = await this.breedingServicesService.findOneById(id, {
            throwException: true,
            template: BreedingServiceDto,
        });
        const serviceEventId = service!.idEvent;

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
            // 1. Eliminar Parturition si existe
            if (parturitionId !== undefined) {
                await this.parturitionsService.deleteById(parturitionId, manager);
                if (parturitionEventId !== undefined) {
                    await this.animalEventsService.deleteById(parturitionEventId, manager);
                }
            }

            // 2. Eliminar GestationDiagnosis si existe
            if (diagnosisId !== undefined) {
                await this.gestationDiagnosesService.deleteById(diagnosisId, manager);
                if (diagnosisEventId !== undefined) {
                    await this.animalEventsService.deleteById(diagnosisEventId, manager);
                }
            }

            // 3. Eliminar BreedingService y su AnimalEvent
            await this.breedingServicesService.deleteById(id, manager);
            await this.animalEventsService.deleteById(serviceEventId, manager);
        });
    }
}
