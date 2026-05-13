import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';

export class UpdateFeedRecordDto {
    @ApiProperty({ description: 'Tipo de alimento', example: 'Balanceado', required: false })
    @IsOptional()
    @IsString()
    @MaxLength(150)
    feedType?: string;

    @ApiProperty({ description: 'Cantidad suministrada', example: 300.0, required: false })
    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    quantity?: number;

    @ApiProperty({ description: 'Unidad de medida', example: 'kg', required: false })
    @IsOptional()
    @IsString()
    @MaxLength(20)
    unit?: string;

    @ApiProperty({ description: 'Costo total', example: 1800.00, required: false })
    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    cost?: number;

    @ApiProperty({ description: 'Notas adicionales', required: false })
    @IsOptional()
    @IsString()
    notes?: string;
}
