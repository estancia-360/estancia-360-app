import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { MovementsService } from 'src/modules/movement-modules/movements/services/movements.service';
import { MovementAnimalsService } from 'src/modules/movement-modules/movement-animals/services/movement-animals.service';
import { MovementDto } from 'src/modules/movement-modules/movements/dto/movement.dto';
import { MovementNotFoundException } from 'src/modules/movement-modules/movements/exceptions/movement-not-found.exception';
import { MovementStatusEnum } from 'src/modules/movement-modules/movements/entities/movement.entity';
import { MovementAnimalStatusEnum } from 'src/modules/movement-modules/movement-animals/entities/movement-animal.entity';
import { RanchAnimal } from 'src/modules/ranch-management/ranch-animals/entities/ranch-animal.entity';
import { MyConflictException } from 'src/shared/exceptions';

@Injectable()
export class CancelMovementUseCase {
    constructor(
        private readonly dataSource: DataSource,
        private readonly movementsService: MovementsService,
        private readonly movementAnimalsService: MovementAnimalsService,
    ) {}

    async execute(idMovement: number): Promise<MovementDto> {
        return await this.dataSource.transaction(async (manager) => {
            const movement = await this.movementsService.findEntityById(idMovement, manager);
            if (!movement) throw new MovementNotFoundException(idMovement);

            if (movement.status === MovementStatusEnum.CANCELLED) {
                return (await this.movementsService.findOneById(idMovement, {
                    throwException: true,
                    template: MovementDto,
                }, manager))!;
            }

            if (movement.status === MovementStatusEnum.CONFIRMED) {
                throw new MyConflictException(
                    `El movimiento ID=${idMovement} ya está confirmado — no puede cancelarse (RN-07).`,
                    'MOVEMENT_ALREADY_CONFIRMED',
                );
            }

            const animals = await this.movementAnimalsService.findByMovement(idMovement, manager);
            for (const ma of animals) {
                if (ma.status === MovementAnimalStatusEnum.PENDING) {
                    await manager.getRepository(RanchAnimal).update(
                        { id: ma.idRanchAnimal },
                        { idStatus: ma.prevIdStatus, updatedAt: new Date() },
                    );
                }
            }

            await this.movementsService.updateStatus(idMovement, MovementStatusEnum.CANCELLED, manager);

            return (await this.movementsService.findOneById(idMovement, {
                throwException: true,
                template: MovementDto,
            }, manager))!;
        });
    }
}
