import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

export class RegisterVaccinationDto {
    @ApiProperty({ description: 'ID of the vaccinated animal', example: 4 })
    @IsInt()
    @IsPositive()
    idRanchAnimal: number;

    @ApiProperty({ example: 'Aftosa' })
    @IsString()
    vaccineName: string;

    @ApiProperty({ example: '5ml', required: false })
    @IsOptional()
    @IsString()
    dose?: string;

    @ApiProperty({ example: 'Dr. Pérez', required: false })
    @IsOptional()
    @IsString()
    responsible?: string;

    @ApiProperty({ example: '2027-02-01T08:00:00.000Z' })
    @IsDateString()
    eventDate: Date;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    isSynced?: boolean;
}
