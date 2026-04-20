import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsBoolean,
    IsDateString,
    IsEnum,
    IsInt,
    IsNumber,
    IsOptional,
    IsPositive,
    IsString,
    Max,
    Min,
    ValidateIf,
} from 'class-validator';
import { RearingDestinationEnum } from 'src/modules/rearing-modules/rearing-selections/entities/rearing-selection.entity';
import { SystemTypeEnum } from 'src/modules/fattening-modules/fattening-entries/entities/fattening-entry.entity';

export class RegisterRearingSelectionDto {
    @ApiProperty({ description: 'ID del animal a seleccionar (debe estar en Recría ps=2)', example: 5 })
    @IsInt()
    @IsPositive()
    idRanchAnimal: number;

    @ApiProperty({ description: 'ID local UUID para idempotencia offline', required: false })
    @IsOptional()
    @IsString()
    localId?: string;

    @ApiProperty({
        description: `Destino del animal tras la selección:
- **replacement**: vuelve a plantel reproductor (permanece en Recría)
- **fattening**: ingresa a Engorde (ps cambia a 3, se crea registro fattening_entry)
- **sale**: dado de baja / venta futura (ps cambia a 4, status a 3)`,
        enum: RearingDestinationEnum,
        example: RearingDestinationEnum.REPLACEMENT,
    })
    @IsEnum(RearingDestinationEnum)
    destination: RearingDestinationEnum;

    @ApiProperty({
        description: 'ID del lote de destino. Obligatorio si destination = "fattening".',
        required: false,
        example: 4,
    })
    @ValidateIf(o => o.destination === RearingDestinationEnum.FATTENING)
    @IsInt()
    @IsPositive()
    idLotDest?: number;

    @ApiProperty({
        description: 'Sistema de engorde. Obligatorio si destination = "fattening".',
        enum: SystemTypeEnum,
        required: false,
        example: SystemTypeEnum.FEEDLOT,
    })
    @ValidateIf(o => o.destination === RearingDestinationEnum.FATTENING)
    @IsEnum(SystemTypeEnum)
    systemType?: SystemTypeEnum;

    @ApiProperty({ description: 'Peso del animal en el momento de la selección (kg)', required: false, example: 200.0 })
    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    weightAtSelection?: number;

    @ApiProperty({ description: 'Condición corporal (1-5)', required: false, minimum: 1, maximum: 5 })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(5)
    bodyCondition?: number;

    @ApiProperty({ description: 'Puntuación genética del animal (0.00–10.00)', required: false, example: 7.5 })
    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    @Max(10)
    geneticScore?: number;

    @ApiProperty({ description: 'Notas adicionales', required: false })
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiProperty({ description: 'Fecha y hora de la selección (ISO 8601)', example: '2026-06-15T10:00:00.000Z' })
    @IsDateString()
    eventDate: Date;

    @ApiProperty({ description: 'Indica si el evento fue registrado offline', required: false })
    @IsOptional()
    @IsBoolean()
    isSynced?: boolean;
}
