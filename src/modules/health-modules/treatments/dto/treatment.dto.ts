import { ApiProperty } from '@nestjs/swagger';
import { DtoField, DtoRelation } from 'src/shared/orm';
import { AnimalEventDto } from 'src/modules/ranch-management/animal-events/dto/animal-event.dto';

export class TreatmentDto {
    @DtoField()
    @ApiProperty({ example: 1 })
    id!: number;

    @DtoField()
    @ApiProperty({ example: 21 })
    idEvent!: number;

    @DtoField()
    @ApiProperty({ example: 'Mastitis', required: false })
    illness?: string;

    @DtoField()
    @ApiProperty({ example: 'Penicilina' })
    medication!: string;

    @DtoField()
    @ApiProperty({ example: '10ml', required: false })
    dose?: string;

    @DtoField()
    @ApiProperty({ example: 5, required: false })
    durationDays?: number;

    @DtoField()
    @ApiProperty({ example: 7, required: false })
    withdrawalDays?: number;

    @DtoField()
    @ApiProperty({ example: '2027-02-08', required: false })
    withdrawalEndDate?: Date;

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
