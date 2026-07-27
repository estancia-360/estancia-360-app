import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

export class RegisterTreatmentDto {
    @ApiProperty({ description: 'ID of the treated animal', example: 4 })
    @IsInt()
    @IsPositive()
    idRanchAnimal: number;

    @ApiProperty({ example: 'Mastitis', required: false })
    @IsOptional()
    @IsString()
    illness?: string;

    @ApiProperty({ example: 'Penicilina' })
    @IsString()
    medication: string;

    @ApiProperty({ example: '10ml', required: false })
    @IsOptional()
    @IsString()
    dose?: string;

    @ApiProperty({ example: 5, required: false })
    @IsOptional()
    @IsInt()
    @IsPositive()
    durationDays?: number;

    @ApiProperty({
        description: 'Sanitary withdrawal days (0 or omitted = no withdrawal). The backend computes withdrawalEndDate = eventDate + withdrawalDays.',
        example: 7,
        required: false,
    })
    @IsOptional()
    @IsInt()
    @IsPositive()
    withdrawalDays?: number;

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
