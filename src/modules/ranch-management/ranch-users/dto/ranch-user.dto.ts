import { ApiProperty } from '@nestjs/swagger';
import { DtoField, DtoRelation } from 'src/shared/orm';
import { RanchRoleDto } from 'src/modules/core/ranch-roles/dto/ranch-role.dto';

/**
 * DTO base de la relación usuario↔estancia: quién, en qué estancia, con qué rol.
 * A propósito NO incluye ni User ni Ranch completos — cada módulo consumidor
 * (ranches para "usuarios de la estancia", users para "estancias del usuario")
 * extiende esto localmente con el lado que le falta, evitando el import
 * circular que tendría este archivo si intentara traer los dos a la vez.
 */
export class RanchUserDto {
    @DtoField()
    @ApiProperty({ example: 8 })
    idUser!: number;

    @DtoField()
    @ApiProperty({ example: 3 })
    idRanch!: number;

    @DtoRelation(() => RanchRoleDto)
    @ApiProperty({ type: () => RanchRoleDto })
    role!: RanchRoleDto;
}
