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
import { EVENT_TYPE_IDS } from '../constants/event-type-ids.constant';
import { MyNotFoundException } from 'src/shared/exceptions';

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
     * Registra un diagnóstico de gestación (palpación o ecografía) para un servicio de monta previo.
     * Validaciones previas:
     *  - El animal hembra existe.
     *  - El servicio de monta existe y pertenece al mismo animal.
     *  - No existe ya un diagnóstico para ese servicio (relación 1:1).
     * Crea el evento animal de tipo DIAGNOSIS y el registro en una sola transacción.
     *
     * @param dto - Datos del diagnóstico.
     * @returns GestationDiagnosisDto con los datos del diagnóstico creado y su evento asociado.
     */
    async execute(dto: RegisterGestationDiagnosisDto): Promise<GestationDiagnosisDto> {
        // Pre-transaction: validar hembra
        await this.ranchAnimalsService.findOneById(dto.idRanchAnimal, {
            throwException: true,
            template: RanchAnimalPlainDto,
            where: { sex: 'F' },
        });

        // Pre-transaction: validar que el servicio existe y pertenece al mismo animal
        const service = await this.breedingServicesService.findOneById(
            dto.idService,
            { throwException: true, template: BreedingServiceDto },
        );
        if (service!.event.idRanchAnimal !== dto.idRanchAnimal) {
            throw new MyNotFoundException(
                `El servicio de monta ID=${dto.idService} no pertenece al animal ID=${dto.idRanchAnimal}.`,
            );
        }

        return await this.dataSource.transaction(async (manager) => {
            // 1. Crear el evento animal
            const event = await this.animalEventsService.create({
                idRanchAnimal: dto.idRanchAnimal,
                idEventType: EVENT_TYPE_IDS.DIAGNOSIS,
                notes: dto.notes,
                isSynced: dto.isSynced ?? false,
                eventDate: new Date(dto.eventDate),
            }, manager);

            // 2. Crear el diagnóstico de gestación
            const diagnosis = await this.gestationDiagnosesService.create({
                idEvent: event.id,
                idService: dto.idService,
                method: dto.method,
                result: dto.result,
                gestationDays: dto.gestationDays,
                estimatedBirth: dto.estimatedBirth,
                veterinarian: dto.veterinarian,
            }, manager);

            // 3. Retornar el DTO completo con las relaciones
            return (await this.gestationDiagnosesService.findOneById(
                diagnosis.id,
                { throwException: true, template: GestationDiagnosisDto },
                manager,
            ))!;
        });
    }
}
