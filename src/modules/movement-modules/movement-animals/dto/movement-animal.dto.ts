import { ApiProperty } from '@nestjs/swagger';
import { DtoField, DtoRelation } from 'src/shared/orm';
import { RanchAnimalPlainDto } from 'src/modules/ranch-management/ranch-animals/dto/ranch-animal-plain.dto';
import { MovementAnimalStatusEnum } from '../entities/movement-animal.entity';

export class MovementAnimalDto {
    @DtoField()
    @ApiProperty({ example: 1 })
    id!: number;

    @DtoField()
    @ApiProperty({ example: 1 })
    idMovement!: number;

    @DtoField()
    @ApiProperty({ example: 4 })
    idRanchAnimal!: number;

    @DtoField()
    @ApiProperty({ required: false, nullable: true })
    idLotOrigin?: number;

    @DtoField()
    @ApiProperty({ required: false, nullable: true })
    idLotDest?: number;

    @DtoField()
    @ApiProperty({ example: 1 })
    prevIdStatus!: number;

    @DtoField()
    @ApiProperty({ enum: MovementAnimalStatusEnum })
    status!: MovementAnimalStatusEnum;

    @DtoField()
    @ApiProperty({ required: false, nullable: true })
    idEvent?: number;

    @DtoField()
    @ApiProperty({ required: false })
    notes?: string;

    @DtoField()
    @ApiProperty({ required: false })
    localId?: string;

    @DtoRelation(() => RanchAnimalPlainDto)
    @ApiProperty({ type: () => RanchAnimalPlainDto })
    animal!: RanchAnimalPlainDto;

    @DtoField()
    @ApiProperty({ example: '2027-03-01T10:00:00.000Z' })
    createdAt!: Date;
}
