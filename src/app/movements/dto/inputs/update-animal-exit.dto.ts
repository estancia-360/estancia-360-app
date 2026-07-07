import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ExitReasonEnum } from 'src/modules/movement-modules/animal-exits/entities/animal-exit.entity';

export class UpdateAnimalExitDto {
    @ApiProperty({ description: 'Nueva causa de la salida', enum: ExitReasonEnum, required: false })
    @IsOptional()
    @IsEnum(ExitReasonEnum)
    reason?: ExitReasonEnum;

    @ApiProperty({ description: 'Nuevo detalle adicional', required: false })
    @IsOptional()
    @IsString()
    notes?: string;
}
