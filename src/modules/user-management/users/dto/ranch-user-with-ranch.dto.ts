import { ApiProperty } from '@nestjs/swagger';
import { DtoRelation } from 'src/shared/orm';
import { RanchUserDto } from 'src/modules/ranch-management/ranch-users/dto/ranch-user.dto';
import { RanchDto } from 'src/modules/ranch-management/ranches/dto/ranch.dto';

// Extiende el DTO base de la relación (idUser, idRanch, role) agregando el
// lado Ranch completo — vista "estancias de este usuario".
export class RanchUserWithRanchDto extends RanchUserDto {
    @DtoRelation(() => RanchDto)
    @ApiProperty({ type: () => RanchDto })
    ranch!: RanchDto;
}
