import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateVaccinationDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    vaccineName?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    dose?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    responsible?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    notes?: string;
}
