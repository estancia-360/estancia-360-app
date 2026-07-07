import { Injectable } from '@nestjs/common';
import { UpdateAnimalExitDto } from '../dto/inputs/update-animal-exit.dto';
import { AnimalExitsService } from 'src/modules/movement-modules/animal-exits/services/animal-exits.service';
import { AnimalExitDto } from 'src/modules/movement-modules/animal-exits/dto/animal-exit.dto';
import { ExitReasonEnum } from 'src/modules/movement-modules/animal-exits/entities/animal-exit.entity';
import { MyBadRequestException } from 'src/shared/exceptions';

@Injectable()
export class UpdateAnimalExitUseCase {
    constructor(private readonly animalExitsService: AnimalExitsService) {}

    async execute(id: number, dto: UpdateAnimalExitDto): Promise<AnimalExitDto> {
        const existing = await this.animalExitsService.findOneById(id, {
            throwException: true,
            template: AnimalExitDto,
        });

        const finalReason = dto.reason ?? existing!.reason;
        const finalNotes = dto.notes !== undefined ? dto.notes : existing!.notes;
        if (finalReason === ExitReasonEnum.OTHER && !finalNotes) {
            throw new MyBadRequestException(
                'Cuando la causa es "other", el campo notes es obligatorio para documentar la salida.',
                'NOTES_REQUIRED_FOR_OTHER',
            );
        }

        await this.animalExitsService.update(id, { reason: dto.reason, notes: dto.notes });

        return (await this.animalExitsService.findOneById(id, {
            throwException: true,
            template: AnimalExitDto,
        }))!;
    }
}
