import { ApiProperty } from '@nestjs/swagger';
import { DtoField, DtoRelation } from 'src/shared/orm';
import { AnimalEventDto } from 'src/modules/ranch-management/animal-events/dto/animal-event.dto';
import { RearingDestinationEnum } from '../entities/rearing-selection.entity';

export class RearingSelectionDto {
    @DtoField()
    @ApiProperty({ example: 1 })
    id!: number;

    @DtoField()
    @ApiProperty({ example: 6 })
    idEvent!: number;

    @DtoField()
    @ApiProperty({ example: 4, nullable: true, required: false })
    idLotDest?: number;

    @DtoField()
    @ApiProperty({ enum: RearingDestinationEnum, example: RearingDestinationEnum.REPLACEMENT })
    destination!: RearingDestinationEnum;

    @DtoField()
    @ApiProperty({ example: 200.0, nullable: true, required: false })
    weightAtSelection?: number;

    @DtoField()
    @ApiProperty({ example: 3, nullable: true, required: false })
    bodyCondition?: number;

    @DtoField()
    @ApiProperty({ example: 7.5, nullable: true, required: false })
    geneticScore?: number;

    @DtoField()
    @ApiProperty({ example: '2026-06-01T10:00:00.000Z' })
    createdAt!: Date;

    @DtoRelation(() => AnimalEventDto)
    @ApiProperty({ type: () => AnimalEventDto })
    event!: AnimalEventDto;
}
