import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RegisterWeaningDto } from '../dto/inputs/register-weaning.dto';
import { AnimalEventsService } from 'src/modules/ranch-management/animal-events/services/animal-events.service';
import { WeaningsService } from 'src/modules/breeding-modules/weanings/services/weanings.service';
import { RanchAnimalsService } from 'src/modules/ranch-management/ranch-animals/services/ranch-animals.service';
import { WeaningDto } from 'src/modules/breeding-modules/weanings/dto/weaning.dto';
import { RanchAnimalPlainDto } from 'src/modules/ranch-management/ranch-animals/dto/ranch-animal-plain.dto';
import { EVENT_TYPE_IDS } from '../constants/event-type-ids.constant';

@Injectable()
export class RegisterWeaningUseCase {
    constructor(
        private readonly dataSource: DataSource,
        private readonly ranchAnimalsService: RanchAnimalsService,
        private readonly animalEventsService: AnimalEventsService,
        private readonly weaningsService: WeaningsService,
    ) {}

    /**
     * Registra el destete de una cría.
     * Validaciones previas:
     *  - El animal existe en el sistema.
     * Dentro de la transacción:
     *  1. Crea el evento animal de tipo WEANING.
     *  2. Crea el registro del destete.
     *  3. Marca al animal como destetado (isWeared = true).
     *
     * @param dto - Datos del destete.
     * @returns WeaningDto con los datos del destete creado y su evento asociado.
     */
    async execute(dto: RegisterWeaningDto): Promise<WeaningDto> {
        // Pre-transaction: validar que el animal existe
        await this.ranchAnimalsService.findOneById(dto.idRanchAnimal, {
            throwException: true,
            template: RanchAnimalPlainDto,
        });

        return await this.dataSource.transaction(async (manager) => {
            // 1. Crear el evento animal
            const event = await this.animalEventsService.create({
                idRanchAnimal: dto.idRanchAnimal,
                idEventType: EVENT_TYPE_IDS.WEANING,
                notes: dto.notes,
                isSynced: dto.isSynced ?? false,
                eventDate: new Date(dto.eventDate),
            }, manager);

            // 2. Crear el registro de destete con el evento creado
            const weaning = await this.weaningsService.create({
                idEvent: event.id,
                idCria: dto.idRanchAnimal,
                idLotDest: dto.idLotDest,
                weaningWeight: dto.weaningWeight,
                weaningAge: dto.weaningAge,
            }, manager);

            return (await this.weaningsService.findOneById(
                weaning.id,
                { throwException: true, template: WeaningDto },
                manager,
            ))!;
        });
    }
}
