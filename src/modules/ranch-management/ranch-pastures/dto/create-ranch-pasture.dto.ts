import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateRanchPastureDto {
    @ApiProperty({ example: 1 })
    @IsNumber()
    @IsNotEmpty()
    idRanch: number;

    @ApiProperty({ example: 'Potrero 1' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 25.5 })
    @IsNumber()
    @Min(0)
    @IsNotEmpty()
    areaHectares: number;

    @ApiProperty({ example: 'Potrero para terneras', required: false })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ example: true, required: false })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
