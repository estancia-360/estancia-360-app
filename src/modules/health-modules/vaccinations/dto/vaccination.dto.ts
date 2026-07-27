import { ApiProperty } from '@nestjs/swagger';
import { DtoField, DtoRelation } from 'src/shared/orm';
import { AnimalEventDto } from 'src/modules/ranch-management/animal-events/dto/animal-event.dto';

export class VaccinationDto {
    @DtoField()
    @ApiProperty({ example: 1 })
    id!: number;

    @DtoField()
    @ApiProperty({ example: 20 })
    idEvent!: number;

    @DtoField()
    @ApiProperty({ example: 'Aftosa' })
    vaccineName!: string;

    @DtoField()
    @ApiProperty({ example: '5ml', required: false })
    dose?: string;

    @DtoField()
    @ApiProperty({ example: 'Dr. Pérez', required: false })
    responsible?: string;

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
