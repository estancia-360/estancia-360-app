import { ApiProperty } from '@nestjs/swagger';
import { PaginationResponseDto } from 'src/shared/dto';
import { UserDto } from './user.dto';

// Concrete subclass needed for Swagger — it cannot resolve generics at runtime.
export class FindAllUsersResponseDto extends PaginationResponseDto<UserDto> {
    @ApiProperty({ type: [UserDto] })
    declare data: UserDto[];
}
