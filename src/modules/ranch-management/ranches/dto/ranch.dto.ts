import { ApiProperty } from '@nestjs/swagger';
import { DtoField, DtoRelation } from 'src/shared/orm';
import { CityDto } from 'src/modules/core/cities/dto/city.dto';
import { RanchProductionTypeDto } from './ranch-production-type.dto';

export class RanchDto {
    @DtoField()
    @ApiProperty({ example: 1 })
    id!: number;

    @DtoField()
    @ApiProperty({ example: 'Estancia San Pedro' })
    name!: string;

    @DtoRelation(() => CityDto)
    @ApiProperty({ type: () => CityDto })
    city!: CityDto;

    @DtoRelation(() => RanchProductionTypeDto)
    @ApiProperty({ type: () => [RanchProductionTypeDto] })
    productionTypes!: RanchProductionTypeDto[];

    @DtoField()
    @ApiProperty({ example: '2026-01-20T14:30:00.000Z' })
    createdAt!: Date;

    @DtoField()
    @ApiProperty({ example: '2026-01-22T10:15:00.000Z' })
    updatedAt!: Date;
}
