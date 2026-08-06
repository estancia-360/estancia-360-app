import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsEnum, IsInt, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { SystemTypeEnum } from 'src/modules/fattening-modules/fattening-entries/entities/fattening-entry.entity';

export class RegisterFatteningEntryDto {
    @ApiProperty({ description: 'ID of the animal entering fattening (must be in ps=2 Recría)', example: 4 })
    @IsInt()
    @IsPositive()
    idRanchAnimal: number;

    @ApiProperty({ description: 'ID of the destination fattening lot', example: 3 })
    @IsInt()
    @IsPositive()
    idLotDest: number;

    @ApiProperty({ enum: SystemTypeEnum, example: SystemTypeEnum.FEEDLOT })
    @IsEnum(SystemTypeEnum)
    systemType: SystemTypeEnum;

    @ApiProperty({ required: false, example: 220.0 })
    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    initialWeight?: number;

    @ApiProperty({ example: '2027-02-01T08:00:00.000Z' })
    @IsDateString()
    eventDate: Date;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    localId?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    isSynced?: boolean;
}
