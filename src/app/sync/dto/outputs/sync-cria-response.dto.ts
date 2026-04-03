import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

// ─────────────────────────────────────────────────────────────────────────────
//  Resultado individual de una operación
// ─────────────────────────────────────────────────────────────────────────────

export class SyncCriaOperationResultDto {
    @ApiProperty({
        description:
            'ID local del dispositivo enviado en la operación. Permite al cliente mapear la respuesta con su registro local.',
        example: 'uuid-device-abc-001',
    })
    @Expose()
    localId: string;

    @ApiProperty({
        description: 'Estado de la operación procesada por el servidor.',
        enum: ['success', 'failed'],
        example: 'success',
    })
    @Expose()
    status: 'success' | 'failed';

    @ApiProperty({
        description:
            'ID del servidor asignado al registro. Presente en create y update exitosos.',
        required: false,
        example: 42,
    })
    @Expose()
    serverId?: number;

    @ApiProperty({
        description: 'Mensaje de error. Presente únicamente si status = "failed".',
        required: false,
        example: 'El potrero con ID = 5 no fue encontrado.',
    })
    @Expose()
    error?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Resumen de una sección
// ─────────────────────────────────────────────────────────────────────────────

export class SyncCriaSectionDto {
    @ApiProperty({
        description: 'Cantidad de operaciones procesadas con éxito en esta sección.',
        example: 2,
    })
    @Expose()
    succeeded: number;

    @ApiProperty({
        description: 'Cantidad de operaciones que fallaron en esta sección.',
        example: 0,
    })
    @Expose()
    failed: number;

    @ApiProperty({
        description: 'Resultados individuales de cada operación en esta sección.',
        type: [SyncCriaOperationResultDto],
    })
    @Expose()
    @Type(() => SyncCriaOperationResultDto)
    results: SyncCriaOperationResultDto[];
}

// ─────────────────────────────────────────────────────────────────────────────
//  Respuesta completa del endpoint
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Respuesta del endpoint POST /sync/cria.
 * Detalla el resultado de cada sección procesada.
 */
export class SyncCriaResponseDto {
    @ApiProperty({
        description: 'Total de operaciones procesadas con éxito en todo el batch.',
        example: 5,
    })
    @Expose()
    totalSucceeded: number;

    @ApiProperty({
        description: 'Total de operaciones que fallaron en todo el batch.',
        example: 1,
    })
    @Expose()
    totalFailed: number;

    @ApiProperty({
        description:
            'Resultados de las operaciones sobre potreros (ranch_pastures). Orden: mismo que el enviado.',
        type: SyncCriaSectionDto,
    })
    @Expose()
    @Type(() => SyncCriaSectionDto)
    ranchPastures: SyncCriaSectionDto;

    @ApiProperty({
        description:
            'Resultados de las operaciones sobre lotes (ranch_lots). Orden: mismo que el enviado.',
        type: SyncCriaSectionDto,
    })
    @Expose()
    @Type(() => SyncCriaSectionDto)
    ranchLots: SyncCriaSectionDto;

    @ApiProperty({
        description:
            'Resultados de las operaciones sobre animales (ranch_animals). Orden: mismo que el enviado.',
        type: SyncCriaSectionDto,
    })
    @Expose()
    @Type(() => SyncCriaSectionDto)
    ranchAnimals: SyncCriaSectionDto;

    @ApiProperty({
        description:
            'Resultados de las operaciones sobre servicios de reproducción (breeding_services). Orden: mismo que el enviado.',
        type: SyncCriaSectionDto,
    })
    @Expose()
    @Type(() => SyncCriaSectionDto)
    breedingServices: SyncCriaSectionDto;

    @ApiProperty({
        description:
            'Resultados de las operaciones sobre diagnósticos de gestación (gestation_diagnoses). Orden: mismo que el enviado.',
        type: SyncCriaSectionDto,
    })
    @Expose()
    @Type(() => SyncCriaSectionDto)
    gestationDiagnoses: SyncCriaSectionDto;

    @ApiProperty({
        description:
            'Resultados de las operaciones sobre partos (parturitions). Orden: mismo que el enviado.',
        type: SyncCriaSectionDto,
    })
    @Expose()
    @Type(() => SyncCriaSectionDto)
    parturitions: SyncCriaSectionDto;

    @ApiProperty({
        description:
            'Resultados de las operaciones sobre destetes (weanings). Orden: mismo que el enviado.',
        type: SyncCriaSectionDto,
    })
    @Expose()
    @Type(() => SyncCriaSectionDto)
    weanings: SyncCriaSectionDto;

    @ApiProperty({
        description:
            'Resultados de las operaciones sobre historiales declarados (animal_declared_histories). Orden: mismo que el enviado.',
        type: SyncCriaSectionDto,
    })
    @Expose()
    @Type(() => SyncCriaSectionDto)
    animalDeclaredHistories: SyncCriaSectionDto;
}
