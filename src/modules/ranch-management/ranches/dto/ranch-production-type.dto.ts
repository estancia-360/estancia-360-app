import { ApiProperty } from '@nestjs/swagger';
import { DtoField, DtoRelation } from 'src/shared/orm';
import { ProductionTypeDto } from 'src/modules/core/production-types/dto/production-type.dto';

export class RanchProductionTypeDto {
    @DtoField()
    @ApiProperty({ example: 1 })
    idProductionType!: number;

    @DtoRelation(() => ProductionTypeDto)
    @ApiProperty({ type: () => ProductionTypeDto })
    productionType!: ProductionTypeDto;
}
