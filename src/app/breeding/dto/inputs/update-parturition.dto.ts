import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { BirthTypeEnum, CriaStatusEnum, MotherConditionEnum } from 'src/modules/breeding-modules/parturitions/entities/parturition.entity';

export class UpdateParturitionDto {
    @ApiProperty({ enum: BirthTypeEnum, required: false, example: BirthTypeEnum.ASSISTED })
    @IsOptional()
    @IsEnum(BirthTypeEnum)
    birthType?: BirthTypeEnum;

    @ApiProperty({ required: false, example: 38 })
    @IsOptional()
    @IsInt()
    @Min(0)
    criaWeight?: number;

    @ApiProperty({ enum: CriaStatusEnum, required: false, example: CriaStatusEnum.ALIVE })
    @IsOptional()
    @IsEnum(CriaStatusEnum)
    criaStatus?: CriaStatusEnum;

    @ApiProperty({ enum: MotherConditionEnum, required: false, example: MotherConditionEnum.GOOD })
    @IsOptional()
    @IsEnum(MotherConditionEnum)
    motherCondition?: MotherConditionEnum;
}
