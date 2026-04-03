import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import {
    BirthTypeEnum,
    CriaStatusEnum,
    MotherConditionEnum,
} from 'src/modules/breeding-modules/parturitions/entities/parturition.entity';

export class UpdateParturitionDto {
    @ApiProperty({
        description: 'Tipo de parto',
        enum: BirthTypeEnum,
        required: false,
        example: BirthTypeEnum.ASSISTED,
    })
    @IsOptional()
    @IsEnum(BirthTypeEnum, { message: 'El tipo de parto debe ser: normal, assisted o cesarean' })
    birthType?: BirthTypeEnum;

    @ApiProperty({
        description: 'Peso de la cría al nacer en kilogramos',
        required: false,
        example: 38,
    })
    @IsOptional()
    @IsInt()
    @Min(0)
    criaWeight?: number;

    @ApiProperty({
        description: 'Estado de la cría al nacer',
        enum: CriaStatusEnum,
        required: false,
        example: CriaStatusEnum.ALIVE,
    })
    @IsOptional()
    @IsEnum(CriaStatusEnum, { message: 'El estado de la cría debe ser: alive o dead' })
    criaStatus?: CriaStatusEnum;

    @ApiProperty({
        description: 'Condición de la madre tras el parto',
        enum: MotherConditionEnum,
        required: false,
        example: MotherConditionEnum.GOOD,
    })
    @IsOptional()
    @IsEnum(MotherConditionEnum, { message: 'La condición de la madre debe ser: good, regular o bad' })
    motherCondition?: MotherConditionEnum;
}
