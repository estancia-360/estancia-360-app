import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { GestationMethodEnum, GestationResultEnum } from 'src/modules/breeding-modules/gestation-diagnoses/entities/gestation-diagnosis.entity';

export class UpdateGestationDiagnosisDto {
    @ApiProperty({ enum: GestationMethodEnum, required: false, example: GestationMethodEnum.ULTRASOUND })
    @IsOptional()
    @IsEnum(GestationMethodEnum)
    method?: GestationMethodEnum;

    @ApiProperty({ enum: GestationResultEnum, required: false, example: GestationResultEnum.PREGNANT })
    @IsOptional()
    @IsEnum(GestationResultEnum)
    result?: GestationResultEnum;

    @ApiProperty({ required: false, example: 45 })
    @IsOptional()
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
}
