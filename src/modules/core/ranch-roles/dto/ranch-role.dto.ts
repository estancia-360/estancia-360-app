import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class RanchRoleDto {
    @ApiProperty({
        description: 'Id de el rol de la estancia',
        type: Number
    })
    @Expose()
    id: number

    @ApiProperty({
        description: 'Nomnbre de el rol de la estancia',
        type: String
    })
    @Expose()
    name: string
}