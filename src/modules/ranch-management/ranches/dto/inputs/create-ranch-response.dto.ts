import { CommonResponseDto } from "src/shared/dto";
import { RanchDto } from "../ranch.dto";
import { ApiProperty } from "@nestjs/swagger";

export class CreateRanchResponseDto extends CommonResponseDto {
    @ApiProperty({
        description: 'Estancia creada',
        type: RanchDto
    })
    ranch: RanchDto
}