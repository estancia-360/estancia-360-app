import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsPositive, Max, Min } from 'class-validator';

export class UpdateRearingSelectionDto {
    @ApiProperty({ required: false })
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

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    @Max(10)
    geneticScore?: number;

    @ApiProperty({ description: 'Edad del animal en días al momento de la selección', required: false, example: 210 })
    @IsOptional()
    @IsInt()
    @IsPositive()
    ageDays?: number;
}
