import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { AnimalEventDto } from 'src/modules/ranch-management/animal-events/dto/animal-event.dto';
import { ExitReasonEnum } from '../entities/animal-exit.entity';

export class AnimalExitDto {
    @ApiProperty({ description: 'ID de la baja', example: 1 })
    @Expose()
    @Type(() => Number)
    id: number;

    @ApiProperty({ description: 'ID del evento animal asociado', example: 30 })
    @Expose()
    @Type(() => Number)
    idEvent: number;

    @ApiProperty({ description: 'Causa de la salida', enum: ExitReasonEnum })
    @Expose()
    reason: ExitReasonEnum;

    @ApiProperty({ description: 'Detalle adicional (obligatorio si reason=other)', required: false })
    @Expose()
    notes?: string;

    @ApiProperty({ description: 'UUID de idempotencia offline', required: false })
    @Expose()
    localId?: string;

    @ApiProperty({ description: 'Evento animal asociado', type: AnimalEventDto })
    @Expose()
    @Type(() => AnimalEventDto)
    event: AnimalEventDto = new AnimalEventDto();

    @ApiProperty({ description: 'Fecha de creación del registro' })
    @Expose()
    createdAt: Date;
}
