import { ApiProperty } from '@nestjs/swagger';
import { DtoField, DtoRelation } from 'src/shared/orm';
import { AnimalEventDto } from 'src/modules/ranch-management/animal-events/dto/animal-event.dto';
import { RanchAnimalPlainDto } from 'src/modules/ranch-management/ranch-animals/dto/ranch-animal-plain.dto';

export class BreedingServiceDto {
    @DtoField()
    @ApiProperty({ example: 1 })
    id!: number;

    @DtoField()
    @ApiProperty({ example: 5 })
    idEvent!: number;

    @DtoField()
    @ApiProperty({ example: 12, nullable: true, required: false })
    idAnimalMale?: number;

    @DtoField()
    @ApiProperty({ enum: ['natural', 'artificial_insemination', 'embryo_transfer'], example: 'natural' })
    serviceType!: string;

    @DtoField()
    @ApiProperty({ example: 'Angus', required: false })
    semenBreed?: string;

    @DtoField()
    @ApiProperty({ example: 'Dr. Pérez', required: false })
    technician?: string;

    @DtoField()
    @ApiProperty({ example: 'LOT-2026-01', required: false })
    reproductiveLot?: string;

    @DtoField()
    @ApiProperty({ example: '2026-03-10T09:00:00.000Z' })
    createdAt!: Date;

    @DtoRelation(() => AnimalEventDto)
    @ApiProperty({ type: () => AnimalEventDto })
    event!: AnimalEventDto;

    @DtoRelation(() => RanchAnimalPlainDto)
    @ApiProperty({ type: () => RanchAnimalPlainDto, nullable: true })
    animalMale?: RanchAnimalPlainDto;
}
