import { ApiProperty } from '@nestjs/swagger';
import { DtoRelation } from 'src/shared/orm';
import { RanchDto } from 'src/modules/ranch-management/ranches/dto/ranch.dto';
import { RanchPastureDto } from './ranch-pasture.dto';

export class RanchPastureDetailedDto extends RanchPastureDto {
    @DtoRelation(() => RanchDto)
    @ApiProperty({ type: () => RanchDto })
    ranch!: RanchDto;
}
