import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';
import { LotTypesEnum } from 'src/shared/enums';

export class CreateRanchLotDto {

    @ApiProperty({ type: Number})
    @IsNumber()
    @IsNotEmpty()
    idRanch: number;


    @ApiProperty({ type: Number})
    @IsNumber()
    @IsNotEmpty()
    idRanchPasture: number;


    @ApiProperty({ type: String})
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    name: string;

    @ApiProperty({ type: String})
    @IsEnum(LotTypesEnum)
    @IsNotEmpty()
    lotType: LotTypesEnum;


    @ApiProperty({ type: Number})
    @IsInt()
    @IsPositive()
    @IsOptional()
    capacity?: number;
}
