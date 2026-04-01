import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class AnimalEventDto {
    @ApiProperty({ description: 'ID del evento', example: 1 })
    @Expose()
    @Type(() => Number)
    id: number;

    @ApiProperty({ description: 'ID del animal de estancia asociado al evento', example: 10 })
    @Expose()
    @Type(() => Number)
    idRanchAnimal: number;

    @ApiProperty({ description: 'ID del tipo de evento', example: 1 })
    @Expose()
    @Type(() => Number)
    idEventType: number;

    @ApiProperty({ description: 'Notas adicionales del evento', required: false, example: 'Sin observaciones' })
    @Expose()
    notes?: string;

    @ApiProperty({ description: 'Indica si el evento fue sincronizado desde dispositivo', example: false })
    @Expose()
    isSynced: boolean;

    @ApiProperty({ description: 'Fecha y hora en que ocurrió el evento', example: '2026-03-10T09:00:00.000Z' })
    @Expose()
    eventDate: Date;

    @ApiProperty({ description: 'Fecha de creación del registro', example: '2026-03-10T09:00:00.000Z' })
    @Expose()
    createdAt: Date;
}
