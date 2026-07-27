import { ApiProperty } from '@nestjs/swagger';
import { DtoField, DtoRelation } from 'src/shared/orm';
import { AnimalEventDto } from 'src/modules/ranch-management/animal-events/dto/animal-event.dto';
import { RanchAnimalPlainDto } from 'src/modules/ranch-management/ranch-animals/dto/ranch-animal-plain.dto';

export class ParturitionDto {
    @DtoField()
    @ApiProperty({ example: 1 })
    id!: number;

    @DtoField()
    @ApiProperty({ example: 7 })
    idEvent!: number;

    @DtoField()
    @ApiProperty({ example: 2 })
    idDiagnosis!: number;

    @DtoField()
    @ApiProperty({ example: 20, nullable: true, required: false })
    idCria?: number;

    @DtoField()
    @ApiProperty({ enum: ['normal', 'assisted', 'cesarean'], example: 'normal' })
    birthType!: string;

    @DtoField()
    @ApiProperty({ example: 35, required: false })
    criaWeight?: number;

    @DtoField()
    @ApiProperty({ enum: ['alive', 'dead'], example: 'alive' })
    criaStatus!: string;

    @DtoField()
    @ApiProperty({ enum: ['good', 'regular', 'bad'], example: 'good', required: false })
    motherCondition?: string;

    @DtoField()
    @ApiProperty({ example: '2026-07-10T06:30:00.000Z' })
    createdAt!: Date;

    @DtoRelation(() => AnimalEventDto)
    @ApiProperty({ type: () => AnimalEventDto })
    event!: AnimalEventDto;

    @DtoRelation(() => RanchAnimalPlainDto)
    @ApiProperty({ type: () => RanchAnimalPlainDto, nullable: true })
    cria?: RanchAnimalPlainDto;
}
