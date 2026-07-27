import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RegisterGestationDiagnosisDto } from '../dto/inputs/register-gestation-diagnosis.dto';
import { AnimalEventsService } from 'src/modules/ranch-management/animal-events/services/animal-events.service';
import { GestationDiagnosesService } from 'src/modules/breeding-modules/gestation-diagnoses/services/gestation-diagnoses.service';
import { BreedingServicesService } from 'src/modules/breeding-modules/breeding-services/services/breeding-services.service';
import { RanchAnimalsService } from 'src/modules/ranch-management/ranch-animals/services/ranch-animals.service';
import { GestationDiagnosisDto } from 'src/modules/breeding-modules/gestation-diagnoses/dto/gestation-diagnosis.dto';
import { RanchAnimalPlainDto } from 'src/modules/ranch-management/ranch-animals/dto/ranch-animal-plain.dto';
import { BreedingServiceDto } from 'src/modules/breeding-modules/breeding-services/dto/breeding-service.dto';
import { EVENT_TYPE_IDS } from 'src/shared/constants';
import { NotFoundException } from '@nestjs/common';
import { RanchAnimalNotFoundException } from 'src/modules/ranch-management/ranch-animals/exceptions';

@Injectable()
export class RegisterGestationDiagnosisUseCase {
    constructor(
        private readonly dataSource: DataSource,
        private readonly ranchAnimalsService: RanchAnimalsService,
        private readonly animalEventsService: AnimalEventsService,
        private readonly breedingServicesService: BreedingServicesService,
        private readonly gestationDiagnosesService: GestationDiagnosesService,
    ) {}

    /**
     * RN-13 (una vaca con diagnóstico pregnant activo no recibe nuevo servicio) no
     * se aplica acá — el viejo la documentaba pero nunca la implementó; múltiples
     * diagnósticos por servicio están permitidos a propósito (el veterinario repite
     * en campo).
     */
    async execute(dto: RegisterGestationDiagnosisDto, idUser?: number): Promise<GestationDiagnosisDto> {
        const female = await this.ranchAnimalsService.findOneById(RanchAnimalPlainDto, dto.idRanchAnimal);
        if (female.sex !== 'F') throw new RanchAnimalNotFoundException(dto.idRanchAnimal);

        const service = await this.breedingServicesService.findOneById(BreedingServiceDto, dto.idService);
        if (service.event.idRanchAnimal !== dto.idRanchAnimal) {
            throw new NotFoundException({
                message: `Breeding service ID=${dto.idService} does not belong to animal ID=${dto.idRanchAnimal}.`,
                error: 'BREEDING_SERVICE_NOT_FOUND',
            });
        }

        return await this.dataSource.transaction(async (manager) => {
            const event = await this.animalEventsService.create(
                {
                    idRanchAnimal: dto.idRanchAnimal,
                    idEventType: EVENT_TYPE_IDS.DIAGNOSIS,
                    idUser,
                    notes: dto.notes,
                    isSynced: dto.isSynced ?? false,
                    eventDate: new Date(dto.eventDate),
                },
                manager,
            );

            const diagnosis = await this.gestationDiagnosesService.create(
                {
                    idEvent: event.id,
                    idService: dto.idService,
                    method: dto.method,
                    result: dto.result,
                    gestationDays: dto.gestationDays,
                    estimatedBirth: dto.estimatedBirth,
                    veterinarian: dto.veterinarian,
                },
                manager,
            );

            return (await this.gestationDiagnosesService.findOneById(
                GestationDiagnosisDto,
                diagnosis.id,
                { throwException: true },
                manager,
            ))!;
        });
    }
}
