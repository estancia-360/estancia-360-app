import { ApiProperty } from "@nestjs/swagger";
import { AnimalBreedDto } from "./animal-breed.dto";

export class FindAllBreedsResopnseDto {
    @ApiProperty({
        description: 'lista de razas de animales',
        type: [AnimalBreedDto]
    })
    breeds: AnimalBreedDto[]
}