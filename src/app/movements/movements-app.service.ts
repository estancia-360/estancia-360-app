import { Injectable } from '@nestjs/common';
import { RegisterMovementDto } from './dto/inputs/register-movement.dto';
import { ConfirmMovementAnimalDto } from './dto/inputs/confirm-movement-animal.dto';
import { RegisterAnimalExitDto } from './dto/inputs/register-animal-exit.dto';
import { UpdateAnimalExitDto } from './dto/inputs/update-animal-exit.dto';
import { MovementDto } from 'src/modules/movement-modules/movements/dto/movement.dto';
import { AnimalExitDto } from 'src/modules/movement-modules/animal-exits/dto/animal-exit.dto';
import { RegisterMovementUseCase } from './use-cases/register-movement.use-case';
import { ConfirmMovementAnimalUseCase } from './use-cases/confirm-movement-animal.use-case';
import { CancelMovementUseCase } from './use-cases/cancel-movement.use-case';
import { RegisterAnimalExitUseCase } from './use-cases/register-animal-exit.use-case';
import { UpdateAnimalExitUseCase } from './use-cases/update-animal-exit.use-case';

@Injectable()
export class MovementsAppService {
    constructor(
        private readonly registerMovementUseCase: RegisterMovementUseCase,
        private readonly confirmMovementAnimalUseCase: ConfirmMovementAnimalUseCase,
        private readonly cancelMovementUseCase: CancelMovementUseCase,
        private readonly registerAnimalExitUseCase: RegisterAnimalExitUseCase,
        private readonly updateAnimalExitUseCase: UpdateAnimalExitUseCase,
    ) {}

    registerMovement(dto: RegisterMovementDto): Promise<MovementDto> {
        return this.registerMovementUseCase.execute(dto);
    }

    confirmMovementAnimal(idMovementAnimal: number, dto: ConfirmMovementAnimalDto): Promise<MovementDto> {
        return this.confirmMovementAnimalUseCase.execute(idMovementAnimal, dto);
    }

    cancelMovement(idMovement: number): Promise<MovementDto> {
        return this.cancelMovementUseCase.execute(idMovement);
    }

    registerAnimalExit(dto: RegisterAnimalExitDto): Promise<AnimalExitDto> {
        return this.registerAnimalExitUseCase.execute(dto);
    }

    updateAnimalExit(id: number, dto: UpdateAnimalExitDto): Promise<AnimalExitDto> {
        return this.updateAnimalExitUseCase.execute(id, dto);
    }
}
