import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsPositive } from 'class-validator';
import { SystemTypeEnum } from 'src/modules/fattening-modules/fattening-entries/entities/fattening-entry.entity';

export class UpdateFatteningEntryDto {
    @ApiProperty({ enum: SystemTypeEnum, required: false })
    @IsOptional()
    @IsEnum(SystemTypeEnum)
    systemType?: SystemTypeEnum;

    @ApiProperty({ required: false, example: 225.0 })
    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    initialWeight?: number;
}
