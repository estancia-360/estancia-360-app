import { ApiProperty } from "@nestjs/swagger";
import { AnimalStatusDto } from "./animal-status.dto";

export class FindAllAnimalStatuesResponseDto {
    @ApiProperty({
        description: 'Lista de stados de animales',
        type: [AnimalStatusDto]
    })
    statues: AnimalStatusDto[]
}