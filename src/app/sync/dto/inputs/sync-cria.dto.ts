import { ApiProperty, ApiPropertyOptional, ApiExtraModels, getSchemaPath } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsArray,
    IsDateString,
    IsIn,
    IsInt,
    IsNotEmpty,
    IsObject,
    IsOptional,
    IsString,
    Min,
    ValidateNested,
    IsNumber,
    IsEnum,
} from 'class-validator';

// ─────────────────────────────────────────────────────────────────────────────
//  Constantes de tipos y operaciones
// ─────────────────────────────────────────────────────────────────────────────

export const SYNC_OPERATION_TYPES = ['create', 'update', 'delete'] as const;
export type SyncOperationType = typeof SYNC_OPERATION_TYPES[number];

export const SYNC_BREEDING_EVENT_TYPES = [
    'breeding_service',
    'gestation_diagnosis',
    'parturition',
    'weaning',
    'animal_declared_history',
] as const;
export type SyncBreedingEventType = typeof SYNC_BREEDING_EVENT_TYPES[number];

// ─────────────────────────────────────────────────────────────────────────────
//  Clase base de operación
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Operación genérica de sincronización.
 * Para referencias a otros registros creados en el MISMO batch (sin serverId aún),
 * usar `localRef_<campo>` en el objeto `data`.
 */
export class BaseSyncOperationDto {
    @ApiProperty({
        type: 'string',
        description:
            'ID local del dispositivo para este registro. Se usa para retornar el mapa localId→serverId en la respuesta.',
        example: 'uuid-device-abc-001',
    })
    @IsString()
    @IsNotEmpty()
    localId: string;

    @ApiProperty({
        type: 'string',
        enum: SYNC_OPERATION_TYPES,
        description: 'Operación a ejecutar.',
        example: 'create',
    })
    @IsIn(SYNC_OPERATION_TYPES, { message: 'La operación debe ser: create, update o delete' })
    operation: SyncOperationType;

    @ApiPropertyOptional({
        type: 'integer',
        description:
            'ID del servidor del registro a actualizar o eliminar. Requerido para operaciones update y delete.',
        example: 42,
    })
    @IsOptional()
    @IsInt()
    serverId?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Operación de potrero (ranch_pastures)
// ─────────────────────────────────────────────────────────────────────────────

export class SyncRanchPastureOperationDto extends BaseSyncOperationDto {
    @ApiProperty({
        type: 'object',
        additionalProperties: true,
        description: `Datos del potrero según la operación.

**CREATE:** Nombre (string), área en hectáreas (number), descripción opcional (string)
**UPDATE:** Solo los campos a modificar (requiere serverId)
**DELETE:** Objeto vacío (requiere serverId)`,
        example: {
            name: 'Potrero Norte',
            areaHectares: 15.5,
            description: 'Campo natural',
        },
    })
    @IsObject()
    @IsNotEmpty()
    data: Record<string, any>;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Operación de lote (ranch_lots)
// ─────────────────────────────────────────────────────────────────────────────

export class SyncRanchLotOperationDto extends BaseSyncOperationDto {
    @ApiProperty({
        type: 'object',
        additionalProperties: true,
        description: `Datos del lote según la operación.

**CREATE:** 
- name (string, obligatorio)
- lotType (enum: breeding|rearing|fattening|reproductive|general, obligatorio)
- idRanchPasture o localRef_idRanchPasture (obligatorio, uno de estos)
- capacity (number, opcional)

**UPDATE:** Solo los campos a modificar (requiere serverId)
**DELETE:** Objeto vacío (requiere serverId)`,
        example: {
            name: 'Lote Cría A',
            lotType: 'breeding',
            idRanchPasture: 1,
            capacity: 50,
        },
    })
    @IsObject()
    @IsNotEmpty()
    data: Record<string, any>;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Operación de animal (ranch_animals)
// ─────────────────────────────────────────────────────────────────────────────

export class SyncRanchAnimalOperationDto extends BaseSyncOperationDto {
    @ApiProperty({
        type: 'object',
        additionalProperties: true,
        description: `Datos del animal según la operación.

**CREATE:**
- code (string, obligatorio)
- idBreed (number, obligatorio)
- idStatus (number, obligatorio)
- idAnimalClass (number, obligatorio)
- sex (F|M, obligatorio)
- birthdate (ISO date, obligatorio)
- idProductiveStatus (number, obligatorio)
- weight (number, opcional)
- origin (string, opcional)
- codeMother o localRef_idMother (opcional)
- codeFather o localRef_idFather (opcional)

**UPDATE:** Solo los campos a modificar (requiere serverId)
**DELETE:** Objeto vacío (requiere serverId)`,
        example: {
            code: 'ANI-001',
            idBreed: 1,
            idStatus: 1,
            idAnimalClass: 1,
            sex: 'F',
            birthdate: '2026-01-15',
            idProductiveStatus: 1,
            weight: 250,
        },
    })
    @IsObject()
    @IsNotEmpty()
    data: Record<string, any>;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Operación de evento de cría
// ─────────────────────────────────────────────────────────────────────────────

export class SyncBreedingEventOperationDto extends BaseSyncOperationDto {
    @ApiProperty({
        type: 'string',
        enum: SYNC_BREEDING_EVENT_TYPES,
        description: 'Tipo de evento de cría a operar.',
        example: 'breeding_service',
    })
    @IsIn(SYNC_BREEDING_EVENT_TYPES, {
        message:
            'El tipo de evento debe ser: breeding_service, gestation_diagnosis, parturition, weaning o animal_declared_history',
    })
    type: SyncBreedingEventType;

    @ApiProperty({
        type: 'string',
        format: 'date-time',
        description:
            'Fecha y hora en que ocurrió el evento en el dispositivo (ISO 8601). Usada como eventDate del registro.',
        example: '2026-03-10T09:00:00.000Z',
    })
    @IsDateString({}, { message: 'happenedAt debe ser una fecha ISO 8601 válida' })
    happenedAt: string;

    @ApiProperty({
        type: 'object',
        additionalProperties: true,
        description: `Datos del evento según su tipo. El contenido varía según el valor de 'type':

**breeding_service:** idRanchAnimal|localRef_idRanchAnimal, serviceType (natural|artificial|embryo), idAnimalMale?, semenBreed?, technician?, reproductiveLot?, notes?

**gestation_diagnosis:** idRanchAnimal|localRef_idRanchAnimal, idService|localRef_idService, method (ultrasound|manual_palpation|blood_test), result (positive|negative|uncertain), gestationDays?, estimatedBirth?, veterinarian?, notes?

**parturition:** idRanchAnimal|localRef_idRanchAnimal, idDiagnosis|localRef_idDiagnosis, birthType (natural|assisted|surgical), criaStatus (alive|stillborn|weak), criaWeight?, motherCondition?, criaData?, notes?

**weaning:** idRanchAnimal|localRef_idRanchAnimal, idLotDest|localRef_idLotDest?, weaningWeight?, ageDays?, notes?

**animal_declared_history:** idRanchAnimal|localRef_idRanchAnimal, prevBirthsCount?, prevLastBirthYear?, prevAvgWeaningWeight?, notes?`,
        example: {
            idRanchAnimal: 1,
            serviceType: 'natural',
            idAnimalMale: 15,
            semenBreed: 'Angus',
            technician: 'Juan Pérez',
            notes: 'Servicio exitoso',
        },
    })
    @IsObject()
    @IsNotEmpty()
    data: Record<string, any>;
}

// ─────────────────────────────────────────────────────────────────────────────
//  DTO principal del endpoint
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Payload de sincronización offline del módulo de CRÍA.
 * 
 * ORDEN DE PROCESAMIENTO (garantizado):
 * 1. ranchPastures → Potreros (sin dependencias externas)
 * 2. ranchLots → Lotes (pueden referenciar potreros del mismo batch con localRef_idRanchPasture)
 * 3. ranchAnimals → Animales (pueden referenciar lotes del mismo batch con localRef_idRanchLot)
 * 4. breedingEvents → Eventos de cría (pueden referenciar animales del mismo batch con localRef_idRanchAnimal)
 * 
 * COMPORTAMIENTO POR OPERACIÓN:
 * - create: Crea el registro. Si ya existe (mismo localId), devuelve el ID existente sin crear duplicado.
 * - update: Modifica solo los campos enviados. Requiere serverId.
 * - delete: Elimina o inactiva el registro. Requiere serverId.
 * 
 * FALLOS INDEPENDIENTES:
 * Si una operación falla, las demás continúan procesándose. El batch nunca se aborta completamente.
 * 
 * REFERENCIAS CRUZADAS DENTRO DEL BATCH:
 * Para referenciar un registro creado en el mismo batch (aún sin serverId), 
 * usar localRef_<campo> en el objeto data. El servidor sustituirá ese valor 
 * por el serverId real asignado al procesar ese registro.
 * 
 * Ejemplo: { "localRef_idRanchPasture": "uuid-potrero-local-1" }
 */
@ApiExtraModels(
    SyncRanchPastureOperationDto,
    SyncRanchLotOperationDto,
    SyncRanchAnimalOperationDto,
    SyncBreedingEventOperationDto,
)
export class SyncCriaDto {
    @ApiProperty({
        type: 'integer',
        description: 'ID de la estancia a la que pertenecen todos los registros del batch.',
        example: 1,
    })
    @IsInt({ message: 'idRanch debe ser un número entero' })
    @Min(1, { message: 'idRanch no es válido' })
    idRanch: number;

    @ApiPropertyOptional({
        type: [SyncRanchPastureOperationDto],
        items: {
            $ref: getSchemaPath(SyncRanchPastureOperationDto),
        },
        description:
            'Operaciones sobre potreros (ranch_pastures). Se procesan primero, sin dependencias externas.',
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SyncRanchPastureOperationDto)
    ranchPastures?: SyncRanchPastureOperationDto[];

    @ApiPropertyOptional({
        type: [SyncRanchLotOperationDto],
        items: {
            $ref: getSchemaPath(SyncRanchLotOperationDto),
        },
        description:
            'Operaciones sobre lotes (ranch_lots). Se procesan después de los potreros. Puede referenciar potreros del mismo batch con localRef_idRanchPasture.',
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SyncRanchLotOperationDto)
    ranchLots?: SyncRanchLotOperationDto[];

    @ApiPropertyOptional({
        type: [SyncRanchAnimalOperationDto],
        items: {
            $ref: getSchemaPath(SyncRanchAnimalOperationDto),
        },
        description:
            'Operaciones sobre animales (ranch_animals). Se procesan después de los lotes. Puede referenciar lotes del mismo batch con localRef_idRanchLot.',
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SyncRanchAnimalOperationDto)
    ranchAnimals?: SyncRanchAnimalOperationDto[];

    @ApiPropertyOptional({
        type: [SyncBreedingEventOperationDto],
        items: {
            $ref: getSchemaPath(SyncBreedingEventOperationDto),
        },
        description:
            'Operaciones sobre eventos de cría. Se procesan al final. Puede referenciar animales del mismo batch con localRef_idRanchAnimal. Tipos: breeding_service, gestation_diagnosis, parturition, weaning, animal_declared_history.',
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SyncBreedingEventOperationDto)
    breedingEvents?: SyncBreedingEventOperationDto[];
}