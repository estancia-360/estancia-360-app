import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsPositive, Max, Min } from 'class-validator';

export class UpdateRearingSelectionDto {
    @ApiProperty({ description: 'Peso en el momento de la selección (kg)', required: false })
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

    @ApiProperty({ description: 'Puntuación genética (0.00–10.00)', required: false })
    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    @Max(10)
    geneticScore?: number;
}
