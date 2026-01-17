import { ApiProperty } from "@nestjs/swagger";
import { UserDto } from "src/modules/user-management/users/dto/user.dto";

export class RegisterClientResponseDto {
    @ApiProperty({
        description: 'Cliente registrado',
        type: UserDto
    })
    user: UserDto
}