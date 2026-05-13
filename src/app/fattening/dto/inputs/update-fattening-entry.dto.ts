import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsPositive } from 'class-validator';
import { SystemTypeEnum } from 'src/modules/fattening-modules/fattening-entries/entities/fattening-entry.entity';

export class UpdateFatteningEntryDto {
    @ApiProperty({ description: 'Nuevo sistema de engorde', enum: SystemTypeEnum, required: false })
    @IsOptional()
    @IsEnum(SystemTypeEnum)
    systemType?: SystemTypeEnum;

    @ApiProperty({ description: 'Nuevo peso inicial (kg)', example: 225.0, required: false })
    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    initialWeight?: number;
}
