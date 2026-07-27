import { ApiProperty } from '@nestjs/swagger';
import { DtoRelation } from 'src/shared/orm';
import { RanchDto } from './ranch.dto';
import { RanchUserWithUserDto } from './ranch-user-with-user.dto';

export class RanchDetailedDto extends RanchDto {
    @DtoRelation(() => RanchUserWithUserDto)
    @ApiProperty({ type: () => [RanchUserWithUserDto] })
    ranchUsers!: RanchUserWithUserDto[];
}
