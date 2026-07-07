import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ConfirmMovementAnimalDto } from '../dto/inputs/confirm-movement-animal.dto';
import { MovementsService } from 'src/modules/movement-modules/movements/services/movements.service';
import { MovementAnimalsService } from 'src/modules/movement-modules/movement-animals/services/movement-animals.service';
import { AnimalEventsService } from 'src/modules/ranch-management/animal-events/services/animal-events.service';
import { MovementDto } from 'src/modules/movement-modules/movements/dto/movement.dto';
import { MovementNotFoundException } from 'src/modules/movement-modules/movements/exceptions/movement-not-found.exception';
import { MovementStatusEnum, MovementTypeEnum } from 'src/modules/movement-modules/movements/entities/movement.entity';
import { MovementAnimalStatusEnum } from 'src/modules/movement-modules/movement-animals/entities/movement-animal.entity';
import { RanchAnimal } from 'src/modules/ranch-management/ranch-animals/entities/ranch-animal.entity';
import { EVENT_TYPE_IDS } from 'src/app/breeding/constants/event-type-ids.constant';
import { PRODUCTIVE_STATUS_IDS } from 'src/app/breeding/constants/productive-status-ids.constant';
import { ANIMAL_STATUS_IDS } from 'src/app/breeding/constants/animal-status-ids.constant';
import { MyBadRequestException, MyConflictException } from 'src/shared/exceptions';

@Injectable()
export class ConfirmMovementAnimalUseCase {
    constructor(
        private readonly dataSource: DataSource,
        private readonly movementsService: MovementsService,
        private readonly movementAnimalsService: MovementAnimalsService,
        private readonly animalEventsService: AnimalEventsService,
    ) {}

    async execute(idMovementAnimal: number, dto: ConfirmMovementAnimalDto): Promise<MovementDto> {
        return await this.dataSource.transaction(async (manager) => {
            const ma = await this.movementAnimalsService.findEntityByIdOrFail(idMovementAnimal, manager);
            const movement = await this.movementsService.findEntityById(ma.idMovement, manager);
            if (!movement) throw new MovementNotFoundException(ma.idMovement);

            if (movement.movementType !== MovementTypeEnum.SALE) {
                throw new MyBadRequestException(
                    `Solo las ventas (sale) tienen confirmación por animal. Este movimiento es de tipo ${movement.movementType}.`,
                    'MOVEMENT_NOT_CONFIRMABLE',
                );
            }

            if (movement.status === MovementStatusEnum.CANCELLED) {
                throw new MyConflictException(
                    `El movimiento ID=${movement.id} está cancelado — no admite más confirmaciones.`,
                    'MOVEMENT_CANCELLED',
                );
            }

            const target = dto.status === 'accepted'
                ? MovementAnimalStatusEnum.ACCEPTED
                : MovementAnimalStatusEnum.REJECTED;

            if (ma.status === target) {
                return (await this.movementsService.findOneById(movement.id, {
                    throwException: true,
                    template: MovementDto,
                }, manager))!;
            }

            if (ma.status !== MovementAnimalStatusEnum.PENDING) {
                throw new MyConflictException(
                    `El animal del movimiento ID=${idMovementAnimal} ya está en estado ${ma.status} — la transición a ${target} no es válida.`,
                    'INVALID_STATUS_TRANSITION',
                );
            }

            if (target === MovementAnimalStatusEnum.ACCEPTED) {
                const event = await this.animalEventsService.create({
                    idRanchAnimal: ma.idRanchAnimal,
                    idEventType: EVENT_TYPE_IDS.SALE,
                    notes: dto.notes,
                    isSynced: dto.isSynced ?? false,
                    eventDate: new Date(movement.movementDate),
                }, manager);

                await this.movementAnimalsService.update(idMovementAnimal, {
                    status: MovementAnimalStatusEnum.ACCEPTED,
                    idEvent: event.id,
                    notes: dto.notes,
                }, manager);

                await manager.getRepository(RanchAnimal).update(
                    { id: ma.idRanchAnimal },
                    {
                        idStatus: ANIMAL_STATUS_IDS.SOLD,
                        idProductiveStatus: PRODUCTIVE_STATUS_IDS.BAJA,
                        updatedAt: new Date(),
                    },
                );
            } else {
                await this.movementAnimalsService.update(idMovementAnimal, {
                    status: MovementAnimalStatusEnum.REJECTED,
                    notes: dto.notes,
                }, manager);

                await manager.getRepository(RanchAnimal).update(
                    { id: ma.idRanchAnimal },
                    { idStatus: ma.prevIdStatus, updatedAt: new Date() },
                );
            }

            const pendingLeft = await this.movementAnimalsService.countByMovementAndStatus(
                movement.id,
                MovementAnimalStatusEnum.PENDING,
                manager,
            );
            if (pendingLeft === 0 && movement.status === MovementStatusEnum.PENDING) {
                await this.movementsService.updateStatus(movement.id, MovementStatusEnum.CONFIRMED, manager);
            }

            return (await this.movementsService.findOneById(movement.id, {
                throwException: true,
                template: MovementDto,
            }, manager))!;
        });
    }
}
