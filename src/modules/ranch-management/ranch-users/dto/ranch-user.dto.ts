import { Expose, Type } from "class-transformer";
import { RanchDto } from "../../ranches/dto/ranch.dto";
import { ApiProperty } from "@nestjs/swagger";
import { RanchRoleDto } from "src/modules/core/ranch-roles/dto/ranch-role.dto";

export class RanchUserWithRanchDto {
    @ApiProperty({
        description: 'Id de la estnacia',
        type: Number
    })
    @Expose()
    idRanch: number

    @ApiProperty({
        description: 'Id del usuario',
        type: Number
    })
    @Expose()
    idUser: number

    @ApiProperty({
        description: 'Eestancia',
        type: RanchDto
    })
    @Expose()
    @Type(() => RanchDto)
    ranch: RanchDto = new RanchDto()


    @ApiProperty({
        description: 'Rol dentro de la estancia',
        type: RanchRoleDto
    })
    @Expose()
    @Type(() => RanchRoleDto)
    role: RanchRoleDto = new RanchRoleDto()
}