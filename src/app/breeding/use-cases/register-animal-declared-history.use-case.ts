import { ConflictException, Injectable } from '@nestjs/common';
import { RegisterAnimalDeclaredHistoryDto } from '../dto/inputs/register-animal-declared-history.dto';
import { AnimalDeclaredHistoryService } from 'src/modules/breeding-modules/animal-declared-history/services/animal-declared-history.service';
import { RanchAnimalsService } from 'src/modules/ranch-management/ranch-animals/services/ranch-animals.service';
import { AnimalDeclaredHistoryDto } from 'src/modules/breeding-modules/animal-declared-history/dto/animal-declared-history.dto';
import { RanchAnimalPlainDto } from 'src/modules/ranch-management/ranch-animals/dto/ranch-animal-plain.dto';

@Injectable()
export class RegisterAnimalDeclaredHistoryUseCase {
    constructor(
        private readonly ranchAnimalsService: RanchAnimalsService,
        private readonly animalDeclaredHistoryService: AnimalDeclaredHistoryService,
    ) {}

    /** No transaction needed — single-table operation. */
    async execute(dto: RegisterAnimalDeclaredHistoryDto): Promise<AnimalDeclaredHistoryDto> {
        await this.ranchAnimalsService.findOneById(RanchAnimalPlainDto, dto.idRanchAnimal);

        const existing = await this.animalDeclaredHistoryService.findOneByAnimalId(
            AnimalDeclaredHistoryDto,
            dto.idRanchAnimal,
            { throwException: false },
        );
        if (existing) {
            throw new ConflictException({
                message: `Animal ID=${dto.idRanchAnimal} already has a declared history registered.`,
                error: 'ANIMAL_DECLARED_HISTORY_ALREADY_EXISTS',
            });
        }

        const history = await this.animalDeclaredHistoryService.create({
            idRanchAnimal: dto.idRanchAnimal,
            prevBirthsCount: dto.prevBirthsCount,
            prevLastBirthYear: dto.prevLastBirthYear,
            prevAvgWeaningWeight: dto.prevAvgWeaningWeight,
            notes: dto.notes,
        });

        return (await this.animalDeclaredHistoryService.findOneById(AnimalDeclaredHistoryDto, history.id, { throwException: true }))!;
    }
}
