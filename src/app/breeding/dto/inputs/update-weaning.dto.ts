import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateWeaningDto {
    @ApiProperty({ required: false, example: 125.5 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    weaningWeight?: number;

    // Nombre de campo "ageDays" preservado tal cual del viejo (es lo que el móvil
    // ya envía) — el viejo tenía un bug donde este valor nunca llegaba a
    // aplicarse (el service esperaba "weaningAge"). Acá sí se aplica.
    @ApiProperty({ required: false, example: 185 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    ageDays?: number;
}
