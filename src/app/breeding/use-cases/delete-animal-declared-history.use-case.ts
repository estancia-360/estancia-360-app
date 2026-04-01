import { Injectable } from '@nestjs/common';
import { AnimalDeclaredHistoryService } from 'src/modules/breeding-modules/animal-declared-history/services/animal-declared-history.service';
import { AnimalDeclaredHistoryDto } from 'src/modules/breeding-modules/animal-declared-history/dto/animal-declared-history.dto';

@Injectable()
export class DeleteAnimalDeclaredHistoryUseCase {
    constructor(
        private readonly animalDeclaredHistoryService: AnimalDeclaredHistoryService,
    ) {}

    /**
     * Elimina el historial reproductivo declarado de un animal.
     * No hay AnimalEvent ni registros dependientes; es una eliminación directa.
     */
    async execute(id: number): Promise<void> {
        // Verificar que existe antes de eliminar
        await this.animalDeclaredHistoryService.findOneById(
            id,
            { throwException: true, template: AnimalDeclaredHistoryDto },
        );
        await this.animalDeclaredHistoryService.deleteById(id);
    }
}
