import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsIn, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';
import { SERVICE_TYPES } from 'src/modules/breeding-modules/breeding-services/entities/breeding-service.entity';

export class RegisterBreedingServiceDto {
    @ApiProperty({ description: 'ID del animal hembra a la que se le realiza el servicio', example: 10 })
    @IsInt({ message: 'El id del animal hembra debe ser un número entero' })
    @IsPositive({ message: 'El id del animal hembra debe ser positivo' })
    idRanchAnimal: number;

    @ApiProperty({
        description: 'ID del animal macho utilizado. Null si es IA con semen de toro no registrado en el sistema.',
        required: false,
        example: 15,
        nullable: true,
    })
    @IsOptional()
    @IsInt({ message: 'El id del animal macho debe ser un número entero' })
    @IsPositive({ message: 'El id del animal macho debe ser positivo' })
    idAnimalMale?: number;

    @ApiProperty({ description: 'Tipo de servicio reproductivo', enum: SERVICE_TYPES, example: 'natural' })
    @IsIn(SERVICE_TYPES, { message: 'El tipo de servicio debe ser: natural, artificial_insemination o embryo_transfer' })
    serviceType: typeof SERVICE_TYPES[number];

    @ApiProperty({ description: 'Raza del semen utilizado (para IA)', required: false, example: 'Angus' })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    semenBreed?: string;

    @ApiProperty({ description: 'Nombre del técnico que realizó el servicio', required: false, example: 'Dr. Pérez' })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    technician?: string;

    @ApiProperty({ description: 'Código del lote reproductivo', required: false, example: 'LOT-2026-01' })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    reproductiveLot?: string;

    @ApiProperty({ description: 'Notas adicionales del evento', required: false })
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiProperty({
        description: 'Fecha y hora en que se realizó el servicio (ISO 8601). Para sync offline usar la fecha real del dispositivo.',
        example: '2026-03-10T09:00:00.000Z',
    })
    @IsDateString({}, { message: 'La fecha del servicio debe tener formato ISO 8601 válido' })
    eventDate: Date;

    @ApiProperty({
        description: 'Indica si el evento fue generado offline y se está sincronizando.',
        required: false,
        example: false,
    })
    @IsOptional()
    isSynced?: boolean;
}
