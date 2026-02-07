import { RanchUserWithRanchDto } from "src/modules/ranch-management/ranch-users/dto/ranch-user.dto";
import { UserDto } from "./user.dto";
import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";

export class UserWithRanchesDto extends UserDto {
    @ApiProperty({
        description: 'Lista de estancias y sus roles dentro de la misma',
        type: [RanchUserWithRanchDto]
    })
    @Expose()
    @Type(() => RanchUserWithRanchDto)
    ranchUsers: RanchUserWithRanchDto[] = [new RanchUserWithRanchDto()];
}