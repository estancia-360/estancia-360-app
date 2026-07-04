import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { AnimalEventDto } from 'src/modules/ranch-management/animal-events/dto/animal-event.dto';
import { IncidentTypeEnum } from '../entities/health-incident.entity';

export class HealthIncidentDto {
    @ApiProperty({ description: 'ID del incidente sanitario', example: 1 })
    @Expose()
    @Type(() => Number)
    id: number;

    @ApiProperty({ description: 'ID del evento animal asociado', example: 22 })
    @Expose()
    @Type(() => Number)
    idEvent: number;

    @ApiProperty({ description: 'Tipo de incidente', enum: IncidentTypeEnum, example: IncidentTypeEnum.QUARANTINE })
    @Expose()
    incidentType: IncidentTypeEnum;

    @ApiProperty({ description: 'Descripción del incidente (síntomas, observaciones)', required: false })
    @Expose()
    description?: string;

    @ApiProperty({ description: 'Fecha de resolución del incidente (null = aún activo)', required: false, nullable: true })
    @Expose()
    resolvedAt?: Date;

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
