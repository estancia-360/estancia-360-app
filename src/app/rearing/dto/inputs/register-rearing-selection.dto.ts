import { ApiProperty } from '@nestjs/swagger';
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
    @ApiProperty({ description: 'ID of the animal to select (must be in Recría ps=2)', example: 5 })
    @IsInt()
    @IsPositive()
    idRanchAnimal: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    localId?: string;

    @ApiProperty({
        description: `Destination after selection:
- **replacement**: back to breeding herd (stays in Recría)
- **fattening**: enters Engorde (ps→3, creates a fattening_entry)
- **sale**: destined for sale/discharge (ps→4, status→3)`,
        enum: RearingDestinationEnum,
        example: RearingDestinationEnum.REPLACEMENT,
    })
    @IsEnum(RearingDestinationEnum)
    destination: RearingDestinationEnum;

    @ApiProperty({ description: 'Destination lot. Required if destination = "fattening".', required: false, example: 4 })
    @ValidateIf((o) => o.destination === RearingDestinationEnum.FATTENING)
    @IsInt()
    @IsPositive()
    idLotDest?: number;

    @ApiProperty({ description: 'Fattening system. Required if destination = "fattening".', enum: SystemTypeEnum, required: false })
    @ValidateIf((o) => o.destination === RearingDestinationEnum.FATTENING)
    @IsEnum(SystemTypeEnum)
    systemType?: SystemTypeEnum;

    @ApiProperty({ required: false, example: 200.0 })
    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    weightAtSelection?: number;

    @ApiProperty({ required: false, minimum: 1, maximum: 5 })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(5)
    bodyCondition?: number;

    @ApiProperty({ required: false, example: 7.5 })
    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    @Max(10)
    geneticScore?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiProperty({ example: '2026-06-15T10:00:00.000Z' })
    @IsDateString()
    eventDate: Date;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    isSynced?: boolean;
}
