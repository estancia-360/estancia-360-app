import { ApiProperty } from '@nestjs/swagger';
import { DtoField, DtoRelation } from 'src/shared/orm';
import { AnimalEventDto } from 'src/modules/ranch-management/animal-events/dto/animal-event.dto';
import { IncidentTypeEnum } from '../entities/health-incident.entity';

export class HealthIncidentDto {
    @DtoField()
    @ApiProperty({ example: 1 })
    id!: number;

    @DtoField()
    @ApiProperty({ example: 22 })
    idEvent!: number;

    @DtoField()
    @ApiProperty({ enum: IncidentTypeEnum, example: IncidentTypeEnum.QUARANTINE })
    incidentType!: IncidentTypeEnum;

    @DtoField()
    @ApiProperty({ required: false })
    description?: string;

    @DtoField()
    @ApiProperty({ required: false, nullable: true })
    resolvedAt?: Date;

    @DtoField()
    @ApiProperty({ required: false })
    notes?: string;

    @DtoField()
    @ApiProperty({ example: '2027-02-01T10:00:00.000Z' })
    createdAt!: Date;

    @DtoRelation(() => AnimalEventDto)
    @ApiProperty({ type: () => AnimalEventDto })
    event!: AnimalEventDto;
}
