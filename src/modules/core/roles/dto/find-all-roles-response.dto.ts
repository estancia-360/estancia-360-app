import { ApiProperty } from '@nestjs/swagger';
import { RoleDto } from './role.dto';

// Contrato del viejo: lista completa sin paginar, wrappeada en { roles }.
export class FindAllRolesResponseDto {
    @ApiProperty({ type: [RoleDto] })
    roles: RoleDto[];
}
