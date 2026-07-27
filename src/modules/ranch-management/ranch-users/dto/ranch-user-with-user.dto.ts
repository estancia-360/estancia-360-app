import { ApiProperty } from '@nestjs/swagger';
import { DtoRelation } from 'src/shared/orm';
import { RanchUserDto } from './ranch-user.dto';
import { UserDto } from 'src/modules/user-management/users/dto/user.dto';

// Extiende el DTO base de la relación (idUser, idRanch, role) agregando el
// lado User completo — vista "miembros de esta estancia", inversa de
// RanchUserWithRanchDto ("estancias de este usuario") en modules/user-management/users.
export class RanchUserWithUserDto extends RanchUserDto {
    @DtoRelation(() => UserDto)
    @ApiProperty({ type: () => UserDto })
    user!: UserDto;
}
