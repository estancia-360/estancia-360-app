import { IsNotEmpty, IsNumber, IsString, IsOptional, IsBoolean, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRanchPastureDto {
    @ApiProperty({ description: 'ID de la estancia', example: 1 })
    @IsNumber()
    @IsNotEmpty()
    idRanch: number;

    @ApiProperty({ description: 'Nombre del potrero', example: 'Potrero 1' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ description: 'Área en hectáreas', example: 25.5 })
    @IsNumber()
    @Min(0)
    @IsNotEmpty()
    areaHectares: number;

    @ApiProperty({ description: 'Descripción', example: 'Potrero para terneras', required: false })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ description: 'Activo', example: true, required: false })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
