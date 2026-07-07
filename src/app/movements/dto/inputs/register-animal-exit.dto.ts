import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsEnum, IsInt, IsOptional, IsPositive, IsString } from 'class-validator';
import { ExitReasonEnum } from 'src/modules/movement-modules/animal-exits/entities/animal-exit.entity';

export class RegisterAnimalExitDto {
    @ApiProperty({ description: 'ID del animal a dar de baja', example: 4 })
    @IsInt()
    @IsPositive()
    idRanchAnimal: number;

    @ApiProperty({ description: 'Causa de la salida', enum: ExitReasonEnum, example: ExitReasonEnum.DEATH })
    @IsEnum(ExitReasonEnum)
    reason: ExitReasonEnum;

    @ApiProperty({ description: 'Detalle adicional. Obligatorio si reason=other.', required: false })
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiProperty({ description: 'Fecha y hora de la baja (ISO 8601)', example: '2027-03-01T08:00:00.000Z' })
    @IsDateString()
    eventDate: Date;

    @ApiProperty({ description: 'UUID de idempotencia offline', required: false })
    @IsOptional()
    @IsString()
    localId?: string;

    @ApiProperty({ description: 'Indica si fue registrado offline', required: false })
    @IsOptional()
    @IsBoolean()
    isSynced?: boolean;
}
