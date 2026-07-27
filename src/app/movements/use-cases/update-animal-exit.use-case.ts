import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdateAnimalExitDto } from '../dto/inputs/update-animal-exit.dto';
import { AnimalExitsService } from 'src/modules/movement-modules/animal-exits/services/animal-exits.service';
import { AnimalExitDto } from 'src/modules/movement-modules/animal-exits/dto/animal-exit.dto';
import { ExitReasonEnum } from 'src/modules/movement-modules/animal-exits/entities/animal-exit.entity';

@Injectable()
export class UpdateAnimalExitUseCase {
    constructor(private readonly animalExitsService: AnimalExitsService) {}

    async execute(id: number, dto: UpdateAnimalExitDto): Promise<AnimalExitDto> {
        const existing = await this.animalExitsService.findOneById(AnimalExitDto, id, { throwException: true });

        const finalReason = dto.reason ?? existing.reason;
        const finalNotes = dto.notes !== undefined ? dto.notes : existing.notes;
        if (finalReason === ExitReasonEnum.OTHER && !finalNotes) {
            throw new BadRequestException({ message: 'When reason is "other", notes is required to document the exit.', error: 'NOTES_REQUIRED_FOR_OTHER' });
        }

        await this.animalExitsService.update(id, { reason: dto.reason, notes: dto.notes });

        return (await this.animalExitsService.findOneById(AnimalExitDto, id, { throwException: true }))!;
    }
}
