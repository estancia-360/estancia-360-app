import { ApiProperty } from "@nestjs/swagger";
import { UserDto } from "src/modules/user-management/users/dto/user.dto";

export class RegisterResponseDto {
    @ApiProperty({
        description: 'Usuario Registrado',
        type: UserDto
    })
    user: UserDto
}