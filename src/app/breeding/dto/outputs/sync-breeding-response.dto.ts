import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

/**
 * Resultado individual de una operación dentro del batch de sincronización.
 */
export class SyncOperationResultDto {
    @ApiProperty({
        description: 'ID local del dispositivo enviado en la operación. Permite al cliente mapear la respuesta con su registro local.',
        example: 'uuid-device-001',
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
        description: 'ID del servidor asignado al nuevo registro. Presente únicamente si status = "success".',
        required: false,
        example: 42,
    })
    @Expose()
    @Type(() => Number)
    serverId?: number;

    @ApiProperty({
        description: 'Tipo de entidad creada.',
        required: false,
        example: 'breeding_service',
    })
    @Expose()
    type?: string;

    @ApiProperty({
        description: 'Mensaje de error descriptivo. Presente únicamente si status = "failed".',
        required: false,
        example: 'El animal con ID = 5 no fue encontrado.',
    })
    @Expose()
    error?: string;
}

/**
 * Respuesta del endpoint de sincronización batch de eventos reproductivos.
 * Incluye un resumen y el detalle por operación.
 */
export class SyncBreedingResponseDto {
    @ApiProperty({
        description: 'Cantidad de operaciones procesadas con éxito.',
        example: 3,
    })
    @Expose()
    @Type(() => Number)
    succeeded: number;

    @ApiProperty({
        description: 'Cantidad de operaciones que fallaron.',
        example: 1,
    })
    @Expose()
    @Type(() => Number)
    failed: number;

    @ApiProperty({
        description: 'Resultados individuales por operación, en el mismo orden que se enviaron.',
        type: [SyncOperationResultDto],
    })
    @Expose()
    @Type(() => SyncOperationResultDto)
    results: SyncOperationResultDto[];
}
