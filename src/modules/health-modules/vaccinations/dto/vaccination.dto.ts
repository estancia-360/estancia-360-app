import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { AnimalEventDto } from 'src/modules/ranch-management/animal-events/dto/animal-event.dto';

export class VaccinationDto {
    @ApiProperty({ description: 'ID de la vacunación', example: 1 })
    @Expose()
    @Type(() => Number)
    id: number;

    @ApiProperty({ description: 'ID del evento animal asociado', example: 20 })
    @Expose()
    @Type(() => Number)
    idEvent: number;

    @ApiProperty({ description: 'Nombre de la vacuna o antiparasitario', example: 'Aftosa' })
    @Expose()
    vaccineName: string;

    @ApiProperty({ description: 'Dosis aplicada', example: '5ml', required: false })
    @Expose()
    dose?: string;

    @ApiProperty({ description: 'Responsable o veterinario', example: 'Dr. Pérez', required: false })
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
