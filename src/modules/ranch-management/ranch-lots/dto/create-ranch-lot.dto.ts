import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';
import { LotTypesEnum } from 'src/shared/enums';

export class CreateRanchLotDto {

    @IsNumber()
    @IsNotEmpty()
    idRanch: number;

    @IsNumber()
    @IsNotEmpty()
    idRanchPasture: number;

    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    name: string;

    @IsEnum(LotTypesEnum)
    @IsNotEmpty()
    lotType: LotTypesEnum;

    @IsInt()
    @IsPositive()
    @IsOptional()
    capacity?: number;
}
