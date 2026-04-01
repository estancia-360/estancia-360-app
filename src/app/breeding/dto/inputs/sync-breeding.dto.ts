import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    ArrayMinSize,
    IsArray,
    IsDateString,
    IsIn,
    IsInt,
    IsNotEmpty,
    IsObject,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';

/**
 * Tipos de operación soportadas en el sync.
 * - create: registrar un nuevo evento reproductivo
 * - update: modificar campos de un registro existente (requiere serverId)
 * - delete: eliminar un registro existente (requiere serverId)
 */
export const SYNC_OPERATION_TYPES = ['create', 'update', 'delete'] as const;

/**
 * Tipos de entidad soportadas en el batch sync.
 */
export const SYNC_BREEDING_TYPES = [
    'breeding_service',
    'gestation_diagnosis',
    'parturition',
    'weaning',
    'animal_declared_history',
] as const;

export class SyncBreedingOperationDto {
    @ApiProperty({
        description: 'ID local del dispositivo móvil para este registro. Usado para mapear la respuesta del servidor y resolver referencias entre operaciones del mismo batch.',
        example: 'uuid-device-001',
    })
    @IsString()
    @IsNotEmpty()
    localId: string;

    @ApiProperty({
        description: 'Tipo de entidad a operar',
        enum: SYNC_BREEDING_TYPES,
        example: 'breeding_service',
    })
    @IsIn(SYNC_BREEDING_TYPES, { message: 'El tipo debe ser: breeding_service, gestation_diagnosis, parturition, weaning o animal_declared_history' })
    type: typeof SYNC_BREEDING_TYPES[number];

    @ApiProperty({
        description: 'Operación a ejecutar.',
        enum: SYNC_OPERATION_TYPES,
        example: 'create',
    })
    @IsIn(SYNC_OPERATION_TYPES, { message: 'La operación debe ser: create, update o delete' })
    operation: typeof SYNC_OPERATION_TYPES[number];

    @ApiPropertyOptional({
        description: 'ID del servidor del registro a actualizar o eliminar. Requerido para operaciones update y delete.',
        example: 42,
    })
    @IsOptional()
    @IsInt()
    serverId?: number;

    @ApiProperty({
        description: 'Fecha y hora en que ocurrió el evento en el dispositivo (ISO 8601). Se usa como eventDate del registro en operaciones create.',
        example: '2026-03-10T09:00:00.000Z',
    })
    @IsDateString({}, { message: 'happenedAt debe tener formato ISO 8601 válido' })
    happenedAt: string;

    @ApiProperty({
        description: `Datos del evento según su tipo y operación.

**create - breeding_service:** { idRanchAnimal, idAnimalMale?, serviceType, semenBreed?, technician?, reproductiveLot?, notes? }
**create - gestation_diagnosis:** { idRanchAnimal, idService | localRef_idService, method, result, gestationDays?, estimatedBirth?, veterinarian?, notes? }
**create - parturition:** { idRanchAnimal, idDiagnosis | localRef_idDiagnosis, birthType, criaStatus, criaWeight?, motherCondition?, criaData?, notes? }
**create - weaning:** { idRanchAnimal, weaningWeight?, ageDays?, notes? }
**create - animal_declared_history:** { idRanchAnimal, prevBirthsCount?, prevLastBirthYear?, prevAvgWeaningWeight?, notes? }

**update:** Solo los campos a modificar (mismos campos que create pero todos opcionales). Requiere serverId.
**delete:** Puede enviarse vacío {}. Requiere serverId.

Para referencias a registros creados en el mismo batch (aún sin ID del servidor),
usar localRef_<campo>: "<localId>" en lugar del ID numérico.
Ejemplo: localRef_idService: "uuid-device-001" en vez de idService: 5`,
        example: {
            idRanchAnimal: 10,
            serviceType: 'natural',
            idAnimalMale: 15,
        },
    })
    @IsObject()
    data: Record<string, any>;
}

export class SyncBreedingDto {
    @ApiProperty({
        description: 'Array de operaciones a sincronizar, ordenadas cronológicamente. El servidor las procesa en el mismo orden que se envían.',
        type: [SyncBreedingOperationDto],
    })
    @IsArray()
    @ArrayMinSize(1, { message: 'Debe haber al menos una operación en el batch' })
    @ValidateNested({ each: true })
    @Type(() => SyncBreedingOperationDto)
    operations: SyncBreedingOperationDto[];
}
