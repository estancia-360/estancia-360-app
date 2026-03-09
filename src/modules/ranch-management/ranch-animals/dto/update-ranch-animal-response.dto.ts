import { ApiProperty } from "@nestjs/swagger";
import { CommonResponseDto } from "src/shared/dto";
import { RanchAnimalDto } from "./ranch-animal.dto";

export class UpdateRanchAnimalResponseDto extends CommonResponseDto {
    @ApiProperty({
        description: 'Animal actualizado',
        type: RanchAnimalDto
    })
    animal: RanchAnimalDto
}
