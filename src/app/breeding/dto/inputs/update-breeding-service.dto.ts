import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { SERVICE_TYPES } from 'src/modules/breeding-modules/breeding-services/entities/breeding-service.entity';

/**
 * DTO para actualizar un servicio de monta.
 * Todos los campos son opcionales — solo se actualiza lo que se envía.
 * No se puede cambiar el animal ni el evento vinculado.
 */
export class UpdateBreedingServiceDto {
    @ApiProperty({
        description: 'Tipo de servicio reproductivo',
        enum: SERVICE_TYPES,
        required: false,
        example: 'artificial_insemination',
    })
    @IsOptional()
    @IsIn(SERVICE_TYPES, { message: `El tipo de servicio debe ser uno de: ${SERVICE_TYPES.join(', ')}` })
    serviceType?: typeof SERVICE_TYPES[number];

    @ApiProperty({
        description: 'Raza del semen utilizado (para inseminación artificial)',
        required: false,
        example: 'Angus',
    })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    semenBreed?: string;

    @ApiProperty({
        description: 'Nombre del técnico que realizó el servicio',
        required: false,
        example: 'Dr. Pérez',
    })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    technician?: string;

    @ApiProperty({
        description: 'Identificador del lote reproductivo',
        required: false,
        example: 'LOT-2026-01',
    })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    reproductiveLot?: string;
}
