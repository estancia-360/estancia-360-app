import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsBoolean,
    IsDateString,
    IsEnum,
    IsIn,
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsPositive,
    IsString,
    MaxLength,
    Min,
    ValidateIf,
    ValidateNested,
} from 'class-validator';
import { BirthTypeEnum, CriaStatusEnum, MotherConditionEnum } from 'src/modules/breeding-modules/parturitions/entities/parturition.entity';

export class CriaRegistrationDto {
    @ApiProperty({ description: "Unique tag/code for the calf", example: 'BOV-2026-045' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    code: string;

    @ApiProperty({ example: 2 })
    @IsInt()
    @IsPositive()
    idBreed: number;

    @ApiProperty({ description: 'Initial animal status ID (active/alive)', example: 1 })
    @IsInt()
    @IsPositive()
    idStatus: number;

    @ApiProperty({ description: 'Animal class ID (e.g. Ternera=1, Ternero Macho Entero=2)', example: 1 })
    @IsInt()
    @IsPositive()
    idAnimalClass: number;

    @ApiProperty({ enum: ['F', 'M'], example: 'F' })
    @IsIn(['F', 'M'])
    sex: 'F' | 'M';

    @ApiProperty({ required: false, example: 35.5 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    weight?: number;
}

export class RegisterParturitionDto {
    @ApiProperty({ description: 'ID of the mother', example: 10 })
    @IsInt()
    @IsPositive()
    idRanchAnimal: number;

    @ApiProperty({ description: 'ID of the positive gestation diagnosis that originates this birth', example: 2 })
    @IsInt()
    @IsPositive()
    idDiagnosis: number;

    @ApiProperty({ enum: BirthTypeEnum, example: BirthTypeEnum.NORMAL })
    @IsEnum(BirthTypeEnum)
    birthType: BirthTypeEnum;

    @ApiProperty({ enum: CriaStatusEnum, example: CriaStatusEnum.ALIVE })
    @IsEnum(CriaStatusEnum)
    criaStatus: CriaStatusEnum;

    @ApiProperty({ required: false, example: 35 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    criaWeight?: number;

    @ApiProperty({ enum: MotherConditionEnum, required: false, example: MotherConditionEnum.GOOD })
    @IsOptional()
    @IsEnum(MotherConditionEnum)
    motherCondition?: MotherConditionEnum;

    @ApiProperty({ description: 'Calf data. REQUIRED if criaStatus = "alive".', type: CriaRegistrationDto, required: false })
    @ValidateIf((o) => o.criaStatus === CriaStatusEnum.ALIVE)
    @ValidateNested()
    @Type(() => CriaRegistrationDto)
    criaData?: CriaRegistrationDto;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiProperty({ example: '2026-07-10T06:30:00.000Z' })
    @IsDateString()
    eventDate: Date;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsBoolean()
    isSynced?: boolean;

    @ApiProperty({ description: 'Client-generated idempotency key for offline sync retries', required: false })
    @IsOptional()
    @IsString()
    localId?: string;
}
