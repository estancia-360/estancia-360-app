import { ApiProperty } from '@nestjs/swagger';
import { DtoRelation } from 'src/shared/orm';
import { RanchDto } from 'src/modules/ranch-management/ranches/dto/ranch.dto';
import { RanchPastureDto } from 'src/modules/ranch-management/ranch-pastures/dto/ranch-pasture.dto';
import { RanchLotDto } from './ranch-lot.dto';

export class RanchLotDetailedDto extends RanchLotDto {
    @DtoRelation(() => RanchDto)
    @ApiProperty({ type: () => RanchDto })
    ranch!: RanchDto;

    @DtoRelation(() => RanchPastureDto)
    @ApiProperty({ type: () => RanchPastureDto })
    pasture!: RanchPastureDto;
}
