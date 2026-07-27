import { ApiProperty } from '@nestjs/swagger';
import { DtoField, DtoRelation } from 'src/shared/orm';
import { AnimalEventDto } from 'src/modules/ranch-management/animal-events/dto/animal-event.dto';
import { WeightTypeEnum } from '../entities/weight-record.entity';

export class WeightRecordDto {
    @DtoField()
    @ApiProperty({ example: 1 })
    id!: number;

    @DtoField()
    @ApiProperty({ example: 5 })
    idEvent!: number;

    @DtoField()
    @ApiProperty({ example: 3 })
    idLot!: number;

    @DtoField()
    @ApiProperty({ example: 185.5 })
    weight!: number;

    @DtoField()
    @ApiProperty({ enum: WeightTypeEnum, example: WeightTypeEnum.SCALE })
    weightType!: WeightTypeEnum;

    @DtoField()
    @ApiProperty({ example: 3, nullable: true, required: false })
    bodyCondition?: number;

    @DtoField()
    @ApiProperty({ example: 180, nullable: true, required: false })
    ageDays?: number;

    @DtoField()
    @ApiProperty({ nullable: true, required: false })
    notes?: string;

    @DtoField()
    @ApiProperty({ example: '2026-05-01T10:00:00.000Z' })
    createdAt!: Date;

    @DtoRelation(() => AnimalEventDto)
    @ApiProperty({ type: () => AnimalEventDto })
    event!: AnimalEventDto;
}
