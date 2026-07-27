import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, Max, MaxLength, Min } from 'class-validator';
import { GestationMethodEnum, GestationResultEnum } from 'src/modules/breeding-modules/gestation-diagnoses/entities/gestation-diagnosis.entity';

export class RegisterGestationDiagnosisDto {
    @ApiProperty({ description: 'ID of the female animal being diagnosed', example: 10 })
    @IsInt()
    @IsPositive()
    idRanchAnimal: number;

    @ApiProperty({ description: 'ID of the breeding service this diagnosis corresponds to', example: 3 })
    @IsInt()
    @IsPositive()
    idService: number;

    @ApiProperty({ enum: GestationMethodEnum, example: GestationMethodEnum.ULTRASOUND })
    @IsEnum(GestationMethodEnum)
    method: GestationMethodEnum;

    @ApiProperty({ enum: GestationResultEnum, example: GestationResultEnum.PREGNANT })
    @IsEnum(GestationResultEnum)
    result: GestationResultEnum;

    @ApiProperty({ required: false, example: 45 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(300)
    gestationDays?: number;

    @ApiProperty({ required: false, example: '2026-09-15' })
    @IsOptional()
    @IsDateString()
    estimatedBirth?: Date;

    @ApiProperty({ required: false, example: 'Dr. López' })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    veterinarian?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiProperty({ example: '2026-04-01T10:00:00.000Z' })
    @IsDateString()
    eventDate: Date;

    @ApiProperty({ required: false })
    @IsOptional()
    isSynced?: boolean;

    @ApiProperty({ description: 'Client-generated idempotency key for offline sync retries', required: false })
    @IsOptional()
    @IsString()
    localId?: string;
}
