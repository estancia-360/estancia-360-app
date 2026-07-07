import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsDateString, IsInt, IsObject, IsOptional, IsPositive, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { BaseSyncOperationDto } from './sync-cria.dto';

export class SyncAnimalExitOperationDto extends BaseSyncOperationDto {
    @ApiProperty({
        description: `Datos de la baja (muerte/descarte/pérdida).
**Campos create:** idRanchAnimal (o localRef_idRanchAnimal), reason ('death'|'discard'|'loss'|'other'), notes (obligatorio si reason=other).
**Campos update:** reason, notes (solo corrección de datos — el estado del animal no cambia).
**Sin delete:** la baja es IRREVERSIBLE (RN-07/RN-10).`,
        example: { idRanchAnimal: 4, reason: 'death', notes: 'Accidente en el potrero' },
    })
    @IsObject()
    data: Record<string, any>;

    @ApiProperty({ description: 'Fecha y hora de la baja (ISO 8601)', example: '2027-05-10T08:00:00.000Z', required: false })
    @IsOptional()
    @IsDateString()
    happenedAt?: string;
}

export class SyncMovementOperationDto extends BaseSyncOperationDto {
    @ApiProperty({
        description: `Datos del movimiento.
**Campos create:** idUser, movementType ('sale'|'purchase'|'pasture_transfer'|'ranch_exit'), movementDate,
counterpartName (sale/ranch_exit), originName (purchase), totalPrice, pricePerKg, notes,
animals: [{ idRanchAnimal | newAnimal | localRef_idRanchAnimal, idLotDest, notes, localId }].
Cada animal anidado DEBE traer su propio localId — la respuesta devuelve su serverId en la sección movementAnimals.
**Campos update:** SOLO { status: 'cancelled' } — cancela el movimiento (los animales pending revierten).
prev_id_status NUNCA se envía — siempre lo calcula el servidor.`,
        example: {
            idUser: 1,
            movementType: 'pasture_transfer',
            movementDate: '2027-05-10',
            animals: [{ idRanchAnimal: 4, idLotDest: 2, localId: 'ma-uuid-001' }],
        },
    })
    @IsObject()
    data: Record<string, any>;

    @ApiProperty({ description: 'Fecha y hora del registro (ISO 8601)', example: '2027-05-10T08:00:00.000Z', required: false })
    @IsOptional()
    @IsDateString()
    happenedAt?: string;
}

export class SyncMovementAnimalOperationDto extends BaseSyncOperationDto {
    @ApiProperty({
        description: `Confirmación/rechazo de UN animal de una venta pendiente.
**Solo operation='update'** (los movement_animals se crean anidados dentro del movimiento).
**Campos:** { status: 'accepted' | 'rejected', notes }.
Requiere serverId del movement_animal (obtenido en un sync previo o en la sección movementAnimals de esta misma respuesta si el movimiento se creó en un batch anterior).
Transiciones idempotentes: repetir la misma decisión → éxito sin efecto. Decisión contraria a una ya aplicada → falla esa operación sola con INVALID_STATUS_TRANSITION.`,
        example: { status: 'accepted' },
    })
    @IsObject()
    data: Record<string, any>;

    @ApiProperty({ description: 'Fecha y hora de la decisión (ISO 8601)', example: '2027-05-12T08:00:00.000Z', required: false })
    @IsOptional()
    @IsDateString()
    happenedAt?: string;
}

export class SyncMovimientosDto {
    @ApiProperty({ description: 'ID de la estancia', example: 1 })
    @IsInt()
    @IsPositive()
    idRanch: number;

    @ApiPropertyOptional({
        type: [SyncAnimalExitOperationDto],
        description: 'Bajas por muerte/descarte/pérdida. Se procesan primero.',
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SyncAnimalExitOperationDto)
    animalExits?: SyncAnimalExitOperationDto[];

    @ApiPropertyOptional({
        type: [SyncMovementOperationDto],
        description: 'Movimientos (create con animales anidados, update solo para cancelar). Se procesan en orden después de las bajas.',
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SyncMovementOperationDto)
    movements?: SyncMovementOperationDto[];

    @ApiPropertyOptional({
        type: [SyncMovementAnimalOperationDto],
        description: 'Confirmaciones/rechazos por animal de ventas pendientes. Se procesan al final.',
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SyncMovementAnimalOperationDto)
    movementAnimals?: SyncMovementAnimalOperationDto[];
}
