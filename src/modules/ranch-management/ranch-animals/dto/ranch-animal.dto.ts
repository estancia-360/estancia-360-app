import { ApiProperty } from '@nestjs/swagger';
import { DtoField, DtoRelation } from 'src/shared/orm';
import { AnimalStatusDto } from 'src/modules/ranch-management/animal-statuses/dto/animal-status.dto';
import { AnimalBreedDto } from 'src/modules/ranch-management/animal-breeds/dto/animal-breed.dto';
import { AnimalClassDto } from 'src/modules/core/animal-classes/dto/animal-class.dto';

export class RanchAnimalDto {
    @DtoField()
    @ApiProperty({ example: 10 })
    id!: number;

    @DtoField()
    @ApiProperty({ example: 1, nullable: true, required: false })
    idProductiveStatus?: number;

    @DtoField()
    @ApiProperty({ example: 1, nullable: true, required: false })
    idLot?: number;

    @DtoField()
    @ApiProperty({ example: 3, nullable: true, required: false })
    idMother?: number;

    @DtoField()
    @ApiProperty({ example: 4, nullable: true, required: false })
    idFather?: number;

    @DtoField()
    @ApiProperty({ example: 'AR-000123' })
    code!: string;

    @DtoRelation(() => AnimalStatusDto)
    @ApiProperty({ type: () => AnimalStatusDto })
    status!: AnimalStatusDto;

    @DtoRelation(() => AnimalBreedDto)
    @ApiProperty({ type: () => AnimalBreedDto })
    breed!: AnimalBreedDto;

    @DtoRelation(() => AnimalClassDto)
    @ApiProperty({ type: () => AnimalClassDto })
    animalClass!: AnimalClassDto;

    @DtoField()
    @ApiProperty({ example: '2023-05-10' })
    birthdate!: Date;

    @DtoField()
    @ApiProperty({ example: 350.75, required: false })
    weight?: number;

    @DtoField()
    @ApiProperty({ enum: ['F', 'M'], example: 'F' })
    sex!: 'F' | 'M';

    @DtoField()
    @ApiProperty({ example: '2026-01-20T14:30:00.000Z' })
    createdAt!: Date;
}
