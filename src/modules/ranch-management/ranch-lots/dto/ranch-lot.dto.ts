import { ApiProperty } from '@nestjs/swagger';
import { DtoField } from 'src/shared/orm';
import { LotTypesEnum } from 'src/shared/enums';

export class RanchLotDto {
    @DtoField()
    @ApiProperty({ example: 1 })
    id!: number;

    @DtoField()
    @ApiProperty({ example: 1 })
    idRanch!: number;

    @DtoField()
    @ApiProperty({ example: 1 })
    idRanchPasture!: number;

    @DtoField()
    @ApiProperty({ example: 'Lote Cría A' })
    name!: string;

    @DtoField()
    @ApiProperty({ enum: LotTypesEnum, example: LotTypesEnum.BREEDING })
    lotType!: LotTypesEnum;

    @DtoField()
    @ApiProperty({ example: 50, nullable: true, required: false })
    capacity?: number | null;

    @DtoField()
    @ApiProperty({ example: true })
    isActive!: boolean;

    // No es @DtoField — no se selecciona de ranch_lots. Se calcula aparte (COUNT
    // sobre ranch_animals) y se asigna a mano SOLO en findAllByRanch(); en el resto
    // de los métodos (findOneById, update) queda undefined — el frontend que use
    // esos otros endpoints debe tratarlo como opcional.
    @ApiProperty({ example: 12, description: 'Cantidad de animales actualmente en este lote', required: false })
    animalsCount?: number;

    @DtoField()
    @ApiProperty({ example: '2026-01-20T14:30:00.000Z' })
    createdAt!: Date;

    @DtoField()
    @ApiProperty({ example: '2026-01-22T10:15:00.000Z' })
    updatedAt!: Date;
}
