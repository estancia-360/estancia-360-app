import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RegisterAnimalExitDto } from '../dto/inputs/register-animal-exit.dto';
import { AnimalExitsService } from 'src/modules/movement-modules/animal-exits/services/animal-exits.service';
import { AnimalEventsService } from 'src/modules/ranch-management/animal-events/services/animal-events.service';
import { RanchAnimalsService } from 'src/modules/ranch-management/ranch-animals/services/ranch-animals.service';
import { AnimalExitDto } from 'src/modules/movement-modules/animal-exits/dto/animal-exit.dto';
import { ExitReasonEnum } from 'src/modules/movement-modules/animal-exits/entities/animal-exit.entity';
import { RanchAnimalPlainDto } from 'src/modules/ranch-management/ranch-animals/dto/ranch-animal-plain.dto';
import { RanchAnimal } from 'src/modules/ranch-management/ranch-animals/entities/ranch-animal.entity';
import { EVENT_TYPE_IDS } from 'src/app/breeding/constants/event-type-ids.constant';
import { PRODUCTIVE_STATUS_IDS } from 'src/app/breeding/constants/productive-status-ids.constant';
import { ANIMAL_STATUS_IDS } from 'src/app/breeding/constants/animal-status-ids.constant';
import { MyBadRequestException, MyConflictException } from 'src/shared/exceptions';

@Injectable()
export class RegisterAnimalExitUseCase {
    constructor(
        private readonly dataSource: DataSource,
        private readonly animalExitsService: AnimalExitsService,
        private readonly animalEventsService: AnimalEventsService,
        private readonly ranchAnimalsService: RanchAnimalsService,
    ) {}

    async execute(dto: RegisterAnimalExitDto): Promise<AnimalExitDto> {
        if (dto.localId) {
            const existing = await this.animalExitsService.findOneByLocalId(dto.localId);
            if (existing) {
                return (await this.animalExitsService.findOneById(existing.id, {
                    throwException: true,
                    template: AnimalExitDto,
                }))!;
            }
        }

        if (dto.reason === ExitReasonEnum.OTHER && !dto.notes) {
            throw new MyBadRequestException(
                'Cuando la causa es "other", el campo notes es obligatorio para documentar la salida.',
                'NOTES_REQUIRED_FOR_OTHER',
            );
        }

        const animal = await this.ranchAnimalsService.findOneById(dto.idRanchAnimal, {
            throwException: true,
            template: RanchAnimalPlainDto,
        });

        if (animal!.idProductiveStatus === PRODUCTIVE_STATUS_IDS.BAJA) {
            throw new MyBadRequestException(
                `El animal ID=${dto.idRanchAnimal} ya está dado de baja (ps=4) — la baja es irreversible y única (RN-02/RN-07).`,
                'ANIMAL_IS_BAJA',
            );
        }

        const entity = await this.dataSource.getRepository(RanchAnimal).findOne({ where: { id: dto.idRanchAnimal } });
        if (entity && entity.idStatus === ANIMAL_STATUS_IDS.PENDING_MOVEMENT) {
            throw new MyConflictException(
                `El animal ID=${dto.idRanchAnimal} está incluido en un movimiento pendiente — resolver ese movimiento antes de registrar la baja.`,
                'ANIMAL_IN_PENDING_MOVEMENT',
            );
        }

        return await this.dataSource.transaction(async (manager) => {
            const event = await this.animalEventsService.create({
                idRanchAnimal: dto.idRanchAnimal,
                idEventType: EVENT_TYPE_IDS.EXIT,
                notes: dto.notes,
                isSynced: dto.isSynced ?? false,
                eventDate: new Date(dto.eventDate),
            }, manager);

            const exit = await this.animalExitsService.create({
                idEvent: event.id,
                reason: dto.reason,
                notes: dto.notes,
                localId: dto.localId,
            }, manager);

            await manager.getRepository(RanchAnimal).update(
                { id: dto.idRanchAnimal },
                {
                    idProductiveStatus: PRODUCTIVE_STATUS_IDS.BAJA,
                    idStatus: ANIMAL_STATUS_IDS.INACTIVO,
                    updatedAt: new Date(),
                },
            );

            return (await this.animalExitsService.findOneById(exit.id, {
                throwException: true,
                template: AnimalExitDto,
            }, manager))!;
        });
    }
}
