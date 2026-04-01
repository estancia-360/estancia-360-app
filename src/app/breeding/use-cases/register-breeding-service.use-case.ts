import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RegisterBreedingServiceDto } from '../dto/inputs/register-breeding-service.dto';
import { AnimalEventsService } from 'src/modules/ranch-management/animal-events/services/animal-events.service';
import { BreedingServicesService } from 'src/modules/breeding-modules/breeding-services/services/breeding-services.service';
import { RanchAnimalsService } from 'src/modules/ranch-management/ranch-animals/services/ranch-animals.service';
import { BreedingServiceDto } from 'src/modules/breeding-modules/breeding-services/dto/breeding-service.dto';
import { RanchAnimalPlainDto } from 'src/modules/ranch-management/ranch-animals/dto/ranch-animal-plain.dto';
import { EVENT_TYPE_IDS } from '../constants/event-type-ids.constant';
import { MyConflictException } from 'src/shared/exceptions';

@Injectable()
export class RegisterBreedingServiceUseCase {
    constructor(
        private readonly dataSource: DataSource,
        private readonly ranchAnimalsService: RanchAnimalsService,
        private readonly animalEventsService: AnimalEventsService,
        private readonly breedingServicesService: BreedingServicesService,
    ) {}

    /**
     * Registra un servicio de monta (monta natural, IA o transferencia de embrión).
     * Crea un evento animal de tipo SERVICE y el registro de breeding_service en una sola transacción.
     *
     * @param dto - Datos del servicio de monta ingresados por el usuario.
     * @returns BreedingServiceDto con los datos del servicio creado y su evento asociado.
     */
    async execute(dto: RegisterBreedingServiceDto): Promise<BreedingServiceDto> {
        // Pre-transaction: validar que la hembra existe
        await this.ranchAnimalsService.findOneById(dto.idRanchAnimal, {
            throwException: true,
            template: RanchAnimalPlainDto,
            where: { sex: 'F' },
        });

        // Pre-transaction: validar el macho si se especificó
        if (dto.idAnimalMale !== undefined && dto.idAnimalMale !== null) {
            await this.ranchAnimalsService.findOneById(dto.idAnimalMale, {
                throwException: true,
                template: RanchAnimalPlainDto,
                where: { sex: 'M' },
            });
        }

        return await this.dataSource.transaction(async (manager) => {
            // 1. Crear el evento animal
            const event = await this.animalEventsService.create({
                idRanchAnimal: dto.idRanchAnimal,
                idEventType: EVENT_TYPE_IDS.SERVICE,
                notes: dto.notes,
                isSynced: dto.isSynced ?? false,
                eventDate: new Date(dto.eventDate),
            }, manager);

            // 2. Crear el registro del servicio de monta
            const service = await this.breedingServicesService.create({
                idEvent: event.id,
                idAnimalMale: dto.idAnimalMale,
                serviceType: dto.serviceType,
                semenBreed: dto.semenBreed,
                technician: dto.technician,
                reproductiveLot: dto.reproductiveLot,
            }, manager);

            // 3. Retornar el DTO completo con las relaciones
            return (await this.breedingServicesService.findOneById(
                service.id,
                { throwException: true, template: BreedingServiceDto },
                manager,
            ))!;
        });
    }
}
