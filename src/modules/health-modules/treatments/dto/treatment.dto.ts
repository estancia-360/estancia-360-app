import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { AnimalEventDto } from 'src/modules/ranch-management/animal-events/dto/animal-event.dto';

export class TreatmentDto {
    @ApiProperty({ description: 'ID del tratamiento', example: 1 })
    @Expose()
    @Type(() => Number)
    id: number;

    @ApiProperty({ description: 'ID del evento animal asociado', example: 21 })
    @Expose()
    @Type(() => Number)
    idEvent: number;

    @ApiProperty({ description: 'Enfermedad o diagnóstico', example: 'Mastitis', required: false })
    @Expose()
    illness?: string;

    @ApiProperty({ description: 'Medicamento aplicado', example: 'Penicilina' })
    @Expose()
    medication: string;

    @ApiProperty({ description: 'Dosis aplicada', example: '10ml', required: false })
    @Expose()
    dose?: string;

    @ApiProperty({ description: 'Duración total del tratamiento en días', example: 5, required: false })
    @Expose()
    @Type(() => Number)
    durationDays?: number;

    @ApiProperty({ description: 'Días de retiro del medicamento (0 o ausente = sin retiro)', example: 7, required: false })
    @Expose()
    @Type(() => Number)
    withdrawalDays?: number;

    @ApiProperty({ description: 'Fecha de fin del retiro, calculada por el backend (event_date + withdrawal_days)', example: '2027-02-08', required: false })
    @Expose()
    withdrawalEndDate?: Date;

    @ApiProperty({ description: 'Veterinario o responsable', example: 'Dr. Pérez', required: false })
    @Expose()
    responsible?: string;

    @ApiProperty({ description: 'Notas adicionales', required: false })
    @Expose()
    notes?: string;

    @ApiProperty({ description: 'Evento animal asociado', type: AnimalEventDto })
    @Expose()
    @Type(() => AnimalEventDto)
    event: AnimalEventDto = new AnimalEventDto();

    @ApiProperty({ description: 'Fecha de creación del registro', example: '2027-02-01T10:00:00.000Z' })
    @Expose()
    createdAt: Date;
}
