import { Body, Controller, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserUp } from 'src/app/auth/decorators';
import { CurrentUser } from 'src/shared/decorators';

import { RegisterMovementUseCase } from './use-cases/register-movement.use-case';
import { ConfirmMovementAnimalUseCase } from './use-cases/confirm-movement-animal.use-case';
import { CancelMovementUseCase } from './use-cases/cancel-movement.use-case';
import { RegisterAnimalExitUseCase } from './use-cases/register-animal-exit.use-case';
import { UpdateAnimalExitUseCase } from './use-cases/update-animal-exit.use-case';

import { RegisterMovementDto } from './dto/inputs/register-movement.dto';
import { ConfirmMovementAnimalDto } from './dto/inputs/confirm-movement-animal.dto';
import { RegisterAnimalExitDto } from './dto/inputs/register-animal-exit.dto';
import { UpdateAnimalExitDto } from './dto/inputs/update-animal-exit.dto';

import { MovementDto } from 'src/modules/movement-modules/movements/dto/movement.dto';
import { AnimalExitDto } from 'src/modules/movement-modules/animal-exits/dto/animal-exit.dto';

// Ruta compartida "movements" con modules/movement-modules/movements/controllers
// (que solo expone GETs) — coexisten sin colisión, ningún método+sub-ruta se repite.
@ApiTags('Movements')
@ApiBearerAuth('access-token')
@Controller('movements')
export class MovementsAppController {
    constructor(
        private readonly registerMovementUseCase: RegisterMovementUseCase,
        private readonly confirmMovementAnimalUseCase: ConfirmMovementAnimalUseCase,
        private readonly cancelMovementUseCase: CancelMovementUseCase,
        private readonly registerAnimalExitUseCase: RegisterAnimalExitUseCase,
        private readonly updateAnimalExitUseCase: UpdateAnimalExitUseCase,
    ) {}

    @Post('register')
    @UserUp()
    @ApiOperation({
        summary: 'Register a batch movement (sale, purchase, pasture transfer, or ranch exit)',
        description:
            'Branches on movementType: pasture_transfer and purchase go straight to confirmed; sale stays pending until each animal is confirmed/rejected; ranch_exit is confirmed but irreversible (ps=Baja). sale/purchase/ranch_exit require the registering user to be ranch Owner. Idempotent via localId.',
    })
    async registerMovement(@Body() dto: RegisterMovementDto, @CurrentUser('id') idUser: number): Promise<{ movement: MovementDto }> {
        return { movement: await this.registerMovementUseCase.execute(dto, idUser) };
    }

    @Patch('animal/:idMovementAnimal/confirm')
    @UserUp()
    @ApiOperation({
        summary: 'Confirm or reject ONE animal of a pending sale',
        description:
            'State machine validated against the current DB state, not what the client assumes. accepted → final sale (irreversible). rejected → reverts to prevIdStatus. Repeating the same transition is idempotent (200, no effect). Conflicting transition → 409 INVALID_STATUS_TRANSITION. Cancelled movement → 409 MOVEMENT_CANCELLED.',
    })
    async confirmMovementAnimal(
        @Param('idMovementAnimal', ParseIntPipe) idMovementAnimal: number,
        @Body() dto: ConfirmMovementAnimalDto,
        @CurrentUser('id') idUser: number,
    ): Promise<{ movement: MovementDto }> {
        return { movement: await this.confirmMovementAnimalUseCase.execute(idMovementAnimal, dto, idUser) };
    }

    @Patch(':idMovement/cancel')
    @UserUp()
    @ApiOperation({
        summary: 'Cancel a pending movement (sale)',
        description: 'Animals still pending revert to prevIdStatus. Already-accepted animals are NOT reverted (RN-07, irreversible sale). Cancelling an already-cancelled movement is idempotent. Cancelling a confirmed movement → 409 MOVEMENT_ALREADY_CONFIRMED.',
    })
    async cancelMovement(
        @Param('idMovement', ParseIntPipe) idMovement: number,
        @CurrentUser('id') idUser: number,
    ): Promise<{ movement: MovementDto }> {
        return { movement: await this.cancelMovementUseCase.execute(idMovement, idUser) };
    }

    @Post('animal-exit')
    @UserUp()
    @ApiOperation({
        summary: 'Register a non-commercial animal exit (death, discard, loss)',
        description: 'ps→Baja + status→Inactivo, IRREVERSIBLE (RN-07/RN-10). No delete endpoint exists. reason=other requires notes.',
    })
    async registerAnimalExit(
        @Body() dto: RegisterAnimalExitDto,
        @CurrentUser('id') idUser: number,
    ): Promise<{ animalExit: AnimalExitDto }> {
        return { animalExit: await this.registerAnimalExitUseCase.execute(dto, idUser) };
    }

    @Patch('animal-exit/:id')
    @UserUp()
    @ApiOperation({ summary: 'Correct the reason or notes of an exit (the animal state does not change — exits are irreversible)' })
    async updateAnimalExit(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateAnimalExitDto,
        @CurrentUser('id') idUser: number,
    ): Promise<{ animalExit: AnimalExitDto }> {
        return { animalExit: await this.updateAnimalExitUseCase.execute(id, dto, idUser) };
    }
}
