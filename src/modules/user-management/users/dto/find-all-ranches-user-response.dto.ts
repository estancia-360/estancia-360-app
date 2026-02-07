import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { RanchDto } from "src/modules/ranch-management/ranches/dto/ranch.dto";
import { UserWithRanchesDto } from "./user-with-ranches.dto";

export class FindAllRanchesUserResponseDto {
    @ApiProperty({
        description: 'Usuario con sus estancias y su informacion de como forma parte en ella ',
        type: UserWithRanchesDto
    })
    @Expose()
    @Type(() => RanchDto)
    user: UserWithRanchesDto = new UserWithRanchesDto()
}