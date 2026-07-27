import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, Min, ValidateNested } from 'class-validator';
import { DataSyncOperationDto, EventSyncOperationDto } from './base-sync-operation.dto';

export class SyncAnimalExitOperationDto extends EventSyncOperationDto {}

/**
 * `data` mirrors RegisterMovementDto: movementType, movementDate,
 * counterpartName/originName, totalPrice/pricePerKg, notes, and an
 * `animals[]` array (each item its own localId, plus either idRanchAnimal /
 * localRef_idRanchAnimal or a nested newAnimal for purchases). Update only
 * accepts `{ status: 'cancelled' }`; delete is not supported (RN-07).
 */
export class SyncMovementOperationDto extends DataSyncOperationDto {}

/**
 * Confirms/rejects one animal of a pending sale. Only `operation: 'update'`
 * is accepted here — nested animals are created as part of the parent
 * `movements` operation, never directly. Target the row via `serverId` or,
 * if it was created earlier in this same batch, via `localId`.
 */
export class SyncMovementAnimalOperationDto extends DataSyncOperationDto {}

/**
 * POST /sync/movimientos — offline batch payload for the Movimientos module.
 * Order: animalExits → movements → movementAnimals.
 */
export class SyncMovimientosDto {
    @ApiProperty({ example: 1 })
    @IsInt()
    @Min(1)
    idRanch: number;

    @ApiPropertyOptional({ type: [SyncAnimalExitOperationDto] })
    @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => SyncAnimalExitOperationDto)
    animalExits?: SyncAnimalExitOperationDto[];

    @ApiPropertyOptional({ type: [SyncMovementOperationDto] })
    @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => SyncMovementOperationDto)
    movements?: SyncMovementOperationDto[];

    @ApiPropertyOptional({ type: [SyncMovementAnimalOperationDto] })
    @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => SyncMovementAnimalOperationDto)
    movementAnimals?: SyncMovementAnimalOperationDto[];
}
