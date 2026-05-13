import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsEnum, IsInt, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { SystemTypeEnum } from 'src/modules/fattening-modules/fattening-entries/entities/fattening-entry.entity';

export class RegisterFatteningEntryDto {
    @ApiProperty({ description: 'ID del animal a ingresar a engorde (debe estar en ps=2 Recría)', example: 4 })
    @IsInt()
    @IsPositive()
    idRanchAnimal: number;

    @ApiProperty({ description: 'ID del lote de engorde destino', example: 3 })
    @IsInt()
    @IsPositive()
    idLotDest: number;

    @ApiProperty({ description: 'Sistema de engorde', enum: SystemTypeEnum, example: SystemTypeEnum.FEEDLOT })
    @IsEnum(SystemTypeEnum)
    systemType: SystemTypeEnum;

    @ApiProperty({ description: 'Peso inicial al ingresar al ciclo de engorde (kg)', example: 220.0, required: false })
    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    initialWeight?: number;

    @ApiProperty({ description: 'Fecha y hora del ingreso a engorde (ISO 8601)', example: '2027-02-01T08:00:00.000Z' })
    @IsDateString()
    eventDate: Date;

    @ApiProperty({ description: 'Notas adicionales', required: false })
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiProperty({ description: 'Indica si el evento fue registrado offline', required: false })
    @IsOptional()
    @IsBoolean()
    isSynced?: boolean;
}
