import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';
import { LotTypesEnum } from 'src/shared/enums';

export class CreateRanchLotDto {
    @ApiProperty({ example: 1 })
    @IsNumber()
    @IsNotEmpty()
    idRanch: number;

    @ApiProperty({ example: 1 })
    @IsNumber()
    @IsNotEmpty()
    idRanchPasture: number;

    @ApiProperty({ example: 'Lote Cría A' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    name: string;

    @ApiProperty({ enum: LotTypesEnum, example: LotTypesEnum.BREEDING })
    @IsEnum(LotTypesEnum)
    @IsNotEmpty()
    lotType: LotTypesEnum;

    @ApiProperty({ example: 50, required: false })
    @IsInt()
    @IsPositive()
    @IsOptional()
    capacity?: number;
}
