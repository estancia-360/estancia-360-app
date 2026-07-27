import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { AnimalBreedsService } from '../services/animal-breeds.service';
import { AnimalBreedDto } from '../dto/animal-breed.dto';
import { UserUp } from 'src/app/auth/decorators';

@ApiTags('Animal Breeds')
@ApiBearerAuth('access-token')
@Controller('animal-breeds')
export class AnimalBreedsController {
    constructor(private readonly animalBreedsService: AnimalBreedsService) {}

    @Get()
    @UserUp()
    @ApiOperation({ summary: 'Get all active animal breeds' })
    @ApiOkResponse({ type: [AnimalBreedDto] })
    // El viejo envuelve en { breeds: ... } — se mantiene igual para no romper el móvil.
    async findAll(): Promise<{ breeds: AnimalBreedDto[] }> {
        return { breeds: await this.animalBreedsService.findAllActive() };
    }
}
