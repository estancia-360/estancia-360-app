import { ApiProperty } from '@nestjs/swagger';
import { DtoField, DtoRelation } from 'src/shared/orm';
import { MovementAnimalDto } from 'src/modules/movement-modules/movement-animals/dto/movement-animal.dto';
import { MovementStatusEnum, MovementTypeEnum } from '../entities/movement.entity';

export class MovementDto {
    @DtoField()
    @ApiProperty({ example: 1 })
    id!: number;

    @DtoField()
    @ApiProperty({ example: 1 })
    idRanch!: number;

    @DtoField()
    @ApiProperty({ required: false, nullable: true })
    idUser?: number;

    @DtoField()
    @ApiProperty({ enum: MovementTypeEnum })
    movementType!: MovementTypeEnum;

    @DtoField()
    @ApiProperty({ example: '2027-03-01' })
    movementDate!: Date;

    @DtoField()
    @ApiProperty({ enum: MovementStatusEnum })
    status!: MovementStatusEnum;

    @DtoField()
    @ApiProperty({ required: false })
    counterpartName?: string;

    @DtoField()
    @ApiProperty({ required: false })
    originName?: string;

    @DtoField()
    @ApiProperty({ required: false })
    totalPrice?: number;

    @DtoField()
    @ApiProperty({ required: false })
    pricePerKg?: number;

    @DtoField()
    @ApiProperty({ required: false })
    notes?: string;

    @DtoField()
    @ApiProperty({ required: false })
    localId?: string;

    @DtoRelation(() => MovementAnimalDto)
    @ApiProperty({ type: () => [MovementAnimalDto] })
    animals!: MovementAnimalDto[];

    @DtoField()
    @ApiProperty({ example: '2027-03-01T10:00:00.000Z' })
    createdAt!: Date;
}
