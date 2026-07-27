import { ApiProperty } from '@nestjs/swagger';
import { DtoField } from 'src/shared/orm';

export class FeedRecordDto {
    @DtoField()
    @ApiProperty({ example: 1 })
    id!: number;

    @DtoField()
    @ApiProperty({ example: 3 })
    idLot!: number;

    @DtoField()
    @ApiProperty({ example: 1, nullable: true, required: false })
    idUser?: number;

    @DtoField()
    @ApiProperty({ example: '2027-03-15' })
    feedDate!: Date;

    @DtoField()
    @ApiProperty({ example: 'Maíz molido' })
    feedType!: string;

    @DtoField()
    @ApiProperty({ example: 250.5, required: false })
    quantity?: number;

    @DtoField()
    @ApiProperty({ example: 'kg', required: false })
    unit?: string;

    @DtoField()
    @ApiProperty({ example: 1500.0, required: false })
    cost?: number;

    @DtoField()
    @ApiProperty({ required: false })
    notes?: string;

    @DtoField()
    @ApiProperty({ example: false })
    isSynced!: boolean;

    @DtoField()
    @ApiProperty({ example: '2027-03-15T10:00:00.000Z' })
    createdAt!: Date;
}
