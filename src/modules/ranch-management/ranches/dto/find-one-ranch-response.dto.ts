import { ApiProperty } from "@nestjs/swagger";
import { RanchDto } from "./ranch.dto";

export class FindOneRanchResponseDto {
    @ApiProperty({
        description: 'Estancia',
        type: RanchDto
    })
    ranch: RanchDto
}