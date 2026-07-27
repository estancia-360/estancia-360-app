import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsInt, IsNumber, IsOptional, IsPositive, Max, Min } from 'class-validator';

export class RegisterWeaningDto {
    @ApiProperty({ description: 'ID of the calf to be weaned', example: 20 })
    @IsInt()
    @IsPositive()
    idRanchAnimal: number;

    @ApiProperty({ description: 'ID of the destination rearing lot', example: 3 })
    @IsInt()
    @IsPositive()
    idLotDest: number;

    @ApiProperty({ required: false, example: 120.5 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    weaningWeight?: number;

    @ApiProperty({ required: false, example: 180 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(730)
    weaningAge?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    notes?: string;

    @ApiProperty({ example: '2026-11-10T08:00:00.000Z' })
    @IsDateString()
    eventDate: Date;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    isSynced?: boolean;
}
