import { ApiProperty } from '@nestjs/swagger';
import { DtoRelation } from 'src/shared/orm';
import { RanchUserDto } from 'src/modules/ranch-management/ranch-users/dto/ranch-user.dto';
import { UserDto } from 'src/modules/user-management/users/dto/user.dto';

// Extiende el DTO base de la relación (idUser, idRanch, role) agregando el
// lado User completo — vista "usuarios de esta estancia".
export class RanchUserWithUserDto extends RanchUserDto {
    @DtoRelation(() => UserDto)
    @ApiProperty({ type: () => UserDto })
    user!: UserDto;
}
