import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { SERVICE_TYPES } from 'src/modules/breeding-modules/breeding-services/entities/breeding-service.entity';

export class UpdateBreedingServiceDto {
    @ApiProperty({ enum: SERVICE_TYPES, required: false, example: 'artificial_insemination' })
    @IsOptional()
    @IsIn(SERVICE_TYPES)
    serviceType?: (typeof SERVICE_TYPES)[number];

    @ApiProperty({ required: false, example: 'Angus' })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    semenBreed?: string;

    @ApiProperty({ required: false, example: 'Dr. Pérez' })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    technician?: string;

    @ApiProperty({ required: false, example: 'LOT-2026-01' })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    reproductiveLot?: string;
}
