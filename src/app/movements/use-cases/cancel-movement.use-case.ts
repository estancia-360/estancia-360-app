import { ConflictException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { MovementsService } from 'src/modules/movement-modules/movements/services/movements.service';
import { MovementAnimalsService } from 'src/modules/movement-modules/movement-animals/services/movement-animals.service';
import { RanchUsersService } from 'src/modules/ranch-management/ranch-users/services/ranch-users.service';
import { MovementDto } from 'src/modules/movement-modules/movements/dto/movement.dto';
import { MovementNotFoundException } from 'src/modules/movement-modules/movements/exceptions';
import { MovementStatusEnum } from 'src/modules/movement-modules/movements/entities/movement.entity';
import { MovementAnimalStatusEnum } from 'src/modules/movement-modules/movement-animals/entities/movement-animal.entity';
import { RanchAnimal } from 'src/modules/ranch-management/ranch-animals/entities/ranch-animal.entity';

@Injectable()
export class CancelMovementUseCase {
    constructor(
        private readonly dataSource: DataSource,
        private readonly movementsService: MovementsService,
        private readonly movementAnimalsService: MovementAnimalsService,
        private readonly ranchUsersService: RanchUsersService,
    ) {}

    async execute(idMovement: number, idUser: number): Promise<MovementDto> {
        return await this.dataSource.transaction(async (manager) => {
            const movement = await this.movementsService.findEntityById(idMovement, manager);
            if (!movement) throw new MovementNotFoundException(idMovement);
            await this.ranchUsersService.assertMember(idUser, movement.idRanch);

            if (movement.status === MovementStatusEnum.CANCELLED) {
                return (await this.movementsService.findOneById(MovementDto, idMovement, { throwException: true }, manager))!;
            }

            if (movement.status === MovementStatusEnum.CONFIRMED) {
                throw new ConflictException({ message: `Movement ID=${idMovement} is already confirmed — it cannot be cancelled (RN-07).`, error: 'MOVEMENT_ALREADY_CONFIRMED' });
            }

            const animals = await this.movementAnimalsService.findByMovement(idMovement, manager);
            for (const ma of animals) {
                if (ma.status === MovementAnimalStatusEnum.PENDING) {
                    await manager.getRepository(RanchAnimal).update({ id: ma.idRanchAnimal }, { idStatus: ma.prevIdStatus, updatedAt: new Date() });
                }
            }

            await this.movementsService.updateStatus(idMovement, MovementStatusEnum.CANCELLED, manager);

            return (await this.movementsService.findOneById(MovementDto, idMovement, { throwException: true }, manager))!;
        });
    }
}
