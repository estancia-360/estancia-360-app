import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RegisterAnimalExitDto } from '../dto/inputs/register-animal-exit.dto';
import { AnimalExitsService } from 'src/modules/movement-modules/animal-exits/services/animal-exits.service';
import { AnimalEventsService } from 'src/modules/ranch-management/animal-events/services/animal-events.service';
import { RanchAnimalsService } from 'src/modules/ranch-management/ranch-animals/services/ranch-animals.service';
import { RanchUsersService } from 'src/modules/ranch-management/ranch-users/services/ranch-users.service';
import { AnimalExitDto } from 'src/modules/movement-modules/animal-exits/dto/animal-exit.dto';
import { ExitReasonEnum } from 'src/modules/movement-modules/animal-exits/entities/animal-exit.entity';
import { RanchAnimalPlainDto } from 'src/modules/ranch-management/ranch-animals/dto/ranch-animal-plain.dto';
import { RanchAnimal } from 'src/modules/ranch-management/ranch-animals/entities/ranch-animal.entity';
import { EVENT_TYPE_IDS, PRODUCTIVE_STATUS_IDS, ANIMAL_STATUS_IDS } from 'src/shared/constants';

@Injectable()
export class RegisterAnimalExitUseCase {
    constructor(
        private readonly dataSource: DataSource,
        private readonly animalExitsService: AnimalExitsService,
        private readonly animalEventsService: AnimalEventsService,
        private readonly ranchAnimalsService: RanchAnimalsService,
        private readonly ranchUsersService: RanchUsersService,
    ) {}

    async execute(dto: RegisterAnimalExitDto, idUser: number): Promise<AnimalExitDto> {
        if (dto.localId) {
            const existing = await this.animalExitsService.findOneByLocalId(dto.localId);
            if (existing) return (await this.animalExitsService.findOneById(AnimalExitDto, existing.id, { throwException: true }))!;
        }

        if (dto.reason === ExitReasonEnum.OTHER && !dto.notes) {
            throw new BadRequestException({ message: 'When reason is "other", notes is required to document the exit.', error: 'NOTES_REQUIRED_FOR_OTHER' });
        }

        const animal = await this.ranchAnimalsService.findOneById(RanchAnimalPlainDto, dto.idRanchAnimal);
        await this.ranchUsersService.assertMember(idUser, animal.idRanch);

        if (animal.idProductiveStatus === PRODUCTIVE_STATUS_IDS.BAJA) {
            throw new BadRequestException({
                message: `Animal ID=${dto.idRanchAnimal} is already discharged (ps=4) — discharge is irreversible and unique (RN-02/RN-07).`,
                error: 'ANIMAL_IS_BAJA',
            });
        }

        const entity = await this.dataSource.getRepository(RanchAnimal).findOne({ where: { id: dto.idRanchAnimal } });
        if (entity && entity.idStatus === ANIMAL_STATUS_IDS.PENDING_MOVEMENT) {
            throw new ConflictException({
                message: `Animal ID=${dto.idRanchAnimal} is included in a pending movement — resolve that movement before registering the exit.`,
                error: 'ANIMAL_IN_PENDING_MOVEMENT',
            });
        }

        return await this.dataSource.transaction(async (manager) => {
            const event = await this.animalEventsService.create(
                {
                    idRanchAnimal: dto.idRanchAnimal,
                    idEventType: EVENT_TYPE_IDS.EXIT,
                    idUser,
                    notes: dto.notes,
                    isSynced: dto.isSynced ?? false,
                    eventDate: new Date(dto.eventDate),
                },
                manager,
            );

            const exit = await this.animalExitsService.create({ idEvent: event.id, reason: dto.reason, notes: dto.notes, localId: dto.localId }, manager);

            await manager
                .getRepository(RanchAnimal)
                .update({ id: dto.idRanchAnimal }, { idProductiveStatus: PRODUCTIVE_STATUS_IDS.BAJA, idStatus: ANIMAL_STATUS_IDS.INACTIVE, updatedAt: new Date() });

            return (await this.animalExitsService.findOneById(AnimalExitDto, exit.id, { throwException: true }, manager))!;
        });
    }
}
