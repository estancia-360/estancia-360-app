import { ApiProperty } from '@nestjs/swagger';
import { DtoField, DtoRelation } from 'src/shared/orm';
import { AnimalEventDto } from 'src/modules/ranch-management/animal-events/dto/animal-event.dto';
import { SystemTypeEnum } from '../entities/fattening-entry.entity';

export class FatteningEntryDto {
    @DtoField()
    @ApiProperty({ example: 1 })
    id!: number;

    @DtoField()
    @ApiProperty({ example: 14 })
    idEvent!: number;

    @DtoField()
    @ApiProperty({ example: 220.0, required: false })
    initialWeight?: number;

    @DtoField()
    @ApiProperty({ enum: SystemTypeEnum, example: SystemTypeEnum.FEEDLOT })
    systemType!: SystemTypeEnum;

    @DtoField()
    @ApiProperty({ example: '2027-02-01T10:00:00.000Z' })
    createdAt!: Date;

    @DtoRelation(() => AnimalEventDto)
    @ApiProperty({ type: () => AnimalEventDto })
    event!: AnimalEventDto;
}
