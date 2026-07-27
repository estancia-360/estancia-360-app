import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsIn, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';
import { SERVICE_TYPES } from 'src/modules/breeding-modules/breeding-services/entities/breeding-service.entity';

export class RegisterBreedingServiceDto {
    @ApiProperty({ description: 'ID of the female animal being served', example: 10 })
    @IsInt()
    @IsPositive()
    idRanchAnimal: number;

    @ApiProperty({
        description: 'ID of the male animal used. Null for AI with unregistered semen donor.',
        required: false,
        example: 15,
        nullable: true,
    })
    @IsOptional()
    @IsInt()
    @IsPositive()
    idAnimalMale?: number;

    @ApiProperty({ enum: SERVICE_TYPES, example: 'natural' })
    @IsIn(SERVICE_TYPES)
    serviceType: (typeof SERVICE_TYPES)[number];

    @ApiProperty({ example: 'Angus', required: false })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    semenBreed?: string;

    @ApiProperty({ example: 'Dr. Pérez', required: false })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    technician?: string;

    @ApiProperty({ example: 'LOT-2026-01', required: false })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    reproductiveLot?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiProperty({ example: '2026-03-10T09:00:00.000Z' })
    @IsDateString()
    eventDate: Date;

    @ApiProperty({ required: false, example: false })
    @IsOptional()
    @IsBoolean()
    isSynced?: boolean;
}
