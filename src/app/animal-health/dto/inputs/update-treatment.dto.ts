import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

export class UpdateTreatmentDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    illness?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    medication?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    dose?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsInt()
    @IsPositive()
    durationDays?: number;

    @ApiProperty({
        description: 'New withdrawal days. The backend recomputes withdrawalEndDate from the (original) event_date + withdrawalDays.',
        required: false,
    })
    @IsOptional()
    @IsInt()
    @IsPositive()
    withdrawalDays?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    responsible?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    notes?: string;
}
