import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { RanchAnimalDto } from "./ranch-animal.dto";
import { PaginationResponseDto } from "src/shared/dto/pagination-response.dto";

export class FindAllRanchAnimalsResponseDto extends PaginationResponseDto<RanchAnimalDto> {
    @ApiProperty({
        description: 'Animales de la estancia',
        type: [RanchAnimalDto]
    })
    declare data: RanchAnimalDto[]
}