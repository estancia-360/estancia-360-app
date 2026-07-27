import { Injectable } from '@nestjs/common';
import { UpdateAnimalDeclaredHistoryDto } from '../dto/inputs/update-animal-declared-history.dto';
import { AnimalDeclaredHistoryService } from 'src/modules/breeding-modules/animal-declared-history/services/animal-declared-history.service';
import { AnimalDeclaredHistoryDto } from 'src/modules/breeding-modules/animal-declared-history/dto/animal-declared-history.dto';

@Injectable()
export class UpdateAnimalDeclaredHistoryUseCase {
    constructor(private readonly animalDeclaredHistoryService: AnimalDeclaredHistoryService) {}

    async execute(id: number, dto: UpdateAnimalDeclaredHistoryDto): Promise<AnimalDeclaredHistoryDto> {
        await this.animalDeclaredHistoryService.update(id, dto);
        return (await this.animalDeclaredHistoryService.findOneById(AnimalDeclaredHistoryDto, id, { throwException: true }))!;
    }
}
