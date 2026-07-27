import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from 'src/modules/user-management/users/dto/user.dto';

export class RegisterResponseDto {
    @ApiProperty({ type: UserDto })
    user: UserDto;
}
