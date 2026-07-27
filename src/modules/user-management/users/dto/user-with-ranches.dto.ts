import { ApiProperty } from '@nestjs/swagger';
import { DtoRelation } from 'src/shared/orm';
import { UserDto } from './user.dto';
import { RanchUserWithRanchDto } from './ranch-user-with-ranch.dto';

export class UserWithRanchesDto extends UserDto {
    @DtoRelation(() => RanchUserWithRanchDto)
    @ApiProperty({ type: () => [RanchUserWithRanchDto] })
    ranchUsers!: RanchUserWithRanchDto[];
}
