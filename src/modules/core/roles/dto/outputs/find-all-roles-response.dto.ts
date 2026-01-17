import { ApiProperty } from "@nestjs/swagger";
import { RoleDto } from "../role.dto";

export class FindAllRolesResponse {
    @ApiProperty({
        description: 'Roles',
        type: [RoleDto]
    })
    roles: RoleDto[]
}