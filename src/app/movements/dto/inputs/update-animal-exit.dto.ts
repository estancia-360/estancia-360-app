import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ExitReasonEnum } from 'src/modules/movement-modules/animal-exits/entities/animal-exit.entity';

export class UpdateAnimalExitDto {
    @ApiProperty({ enum: ExitReasonEnum, required: false })
    @IsOptional()
    @IsEnum(ExitReasonEnum)
    reason?: ExitReasonEnum;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    notes?: string;
}
