import { ApiProperty } from '@nestjs/swagger';
import { DtoField, DtoRelation } from 'src/shared/orm';
import { AnimalEventDto } from 'src/modules/ranch-management/animal-events/dto/animal-event.dto';
import { RanchAnimalDto } from 'src/modules/ranch-management/ranch-animals/dto/ranch-animal.dto';

export class WeaningDto {
    @DtoField()
    @ApiProperty({ example: 1 })
    id!: number;

    @DtoField()
    @ApiProperty({ example: 8 })
    idEvent!: number;

    @DtoField()
    @ApiProperty({ example: 5 })
    idCria!: number;

    @DtoField()
    @ApiProperty({ example: 3 })
    idLotDest!: number;

    @DtoField()
    @ApiProperty({ example: 120.5, required: false })
    weaningWeight?: number;

    @DtoField()
    @ApiProperty({ example: 180, required: false })
    weaningAge?: number;

    @DtoField()
    @ApiProperty({ example: '2026-11-10T08:00:00.000Z' })
    createdAt!: Date;

    @DtoRelation(() => AnimalEventDto)
    @ApiProperty({ type: () => AnimalEventDto })
    event!: AnimalEventDto;

    @DtoRelation(() => RanchAnimalDto)
    @ApiProperty({ type: () => RanchAnimalDto })
    cria?: RanchAnimalDto;
}
