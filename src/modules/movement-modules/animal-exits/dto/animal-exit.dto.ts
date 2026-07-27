import { ApiProperty } from '@nestjs/swagger';
import { DtoField, DtoRelation } from 'src/shared/orm';
import { AnimalEventDto } from 'src/modules/ranch-management/animal-events/dto/animal-event.dto';
import { ExitReasonEnum } from '../entities/animal-exit.entity';

export class AnimalExitDto {
    @DtoField()
    @ApiProperty({ example: 1 })
    id!: number;

    @DtoField()
    @ApiProperty({ example: 30 })
    idEvent!: number;

    @DtoField()
    @ApiProperty({ enum: ExitReasonEnum })
    reason!: ExitReasonEnum;

    @DtoField()
    @ApiProperty({ required: false })
    notes?: string;

    @DtoField()
    @ApiProperty({ required: false })
    localId?: string;

    @DtoRelation(() => AnimalEventDto)
    @ApiProperty({ type: () => AnimalEventDto })
    event!: AnimalEventDto;

    @DtoField()
    @ApiProperty({ example: '2027-03-01T10:00:00.000Z' })
    createdAt!: Date;
}
