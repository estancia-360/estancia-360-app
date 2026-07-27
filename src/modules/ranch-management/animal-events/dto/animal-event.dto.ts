import { ApiProperty } from '@nestjs/swagger';
import { DtoField, DtoRelation } from 'src/shared/orm';
import { RanchAnimalPlainDto } from 'src/modules/ranch-management/ranch-animals/dto/ranch-animal-plain.dto';

export class AnimalEventDto {
    @DtoField()
    @ApiProperty({ example: 1 })
    id!: number;

    @DtoField()
    @ApiProperty({ example: 10 })
    idRanchAnimal!: number;

    @DtoField()
    @ApiProperty({ example: 1 })
    idEventType!: number;

    @DtoField()
    @ApiProperty({ example: 'Sin observaciones', required: false })
    notes?: string;

    @DtoField()
    @ApiProperty({ example: false })
    isSynced!: boolean;

    @DtoField()
    @ApiProperty({ example: '2026-03-10T09:00:00.000Z' })
    eventDate!: Date;

    @DtoField()
    @ApiProperty({ example: '2026-03-10T09:00:00.000Z' })
    createdAt!: Date;

    @DtoRelation(() => RanchAnimalPlainDto)
    @ApiProperty({ type: () => RanchAnimalPlainDto })
    animal!: RanchAnimalPlainDto;
}
