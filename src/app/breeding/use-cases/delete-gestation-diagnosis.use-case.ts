import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { GestationDiagnosesService } from 'src/modules/breeding-modules/gestation-diagnoses/services/gestation-diagnoses.service';
import { ParturitionsService } from 'src/modules/breeding-modules/parturitions/services/parturitions.service';
import { AnimalEventsService } from 'src/modules/ranch-management/animal-events/services/animal-events.service';
import { GestationDiagnosisDto } from 'src/modules/breeding-modules/gestation-diagnoses/dto/gestation-diagnosis.dto';

@Injectable()
export class DeleteGestationDiagnosisUseCase {
    constructor(
        private readonly dataSource: DataSource,
        private readonly gestationDiagnosesService: GestationDiagnosesService,
        private readonly parturitionsService: ParturitionsService,
        private readonly animalEventsService: AnimalEventsService,
    ) {}

    /**
     * Elimina un diagnóstico de gestación y su Parturition dependiente (si existe).
     * También elimina los AnimalEvents asociados.
     *
     * Orden de eliminación:
     *  1. Parturition + su AnimalEvent
     *  2. GestationDiagnosis + su AnimalEvent
     */
    async execute(id: number): Promise<void> {
        const diagnosis = await this.gestationDiagnosesService.findOneById(id, {
            throwException: true,
            template: GestationDiagnosisDto,
        });
        const diagnosisEventId = diagnosis!.idEvent;

        const parturition = await this.parturitionsService.findOneByDiagnosisId(id);
        let parturitionId: number | undefined;
        let parturitionEventId: number | undefined;
        if (parturition) {
            parturitionId = parturition.id;
            parturitionEventId = parturition.idEvent;
        }

        await this.dataSource.transaction(async (manager) => {
            // 1. Eliminar Parturition si existe
            if (parturitionId !== undefined) {
                await this.parturitionsService.deleteById(parturitionId, manager);
                if (parturitionEventId !== undefined) {
                    await this.animalEventsService.deleteById(parturitionEventId, manager);
                }
            }

            // 2. Eliminar GestationDiagnosis y su AnimalEvent
            await this.gestationDiagnosesService.deleteById(id, manager);
            await this.animalEventsService.deleteById(diagnosisEventId, manager);
        });
    }
}
