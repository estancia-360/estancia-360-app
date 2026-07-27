import { BadRequestException, ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { RegisterMovementDto, RegisterMovementAnimalDto } from '../dto/inputs/register-movement.dto';
import { MovementsService } from 'src/modules/movement-modules/movements/services/movements.service';
import { MovementAnimalsService } from 'src/modules/movement-modules/movement-animals/services/movement-animals.service';
import { AnimalEventsService } from 'src/modules/ranch-management/animal-events/services/animal-events.service';
import { RanchAnimalsService } from 'src/modules/ranch-management/ranch-animals/services/ranch-animals.service';
import { RanchUsersService } from 'src/modules/ranch-management/ranch-users/services/ranch-users.service';
import { TreatmentsService } from 'src/modules/health-modules/treatments/services/treatments.service';
import { MovementDto } from 'src/modules/movement-modules/movements/dto/movement.dto';
import { Movement, MovementStatusEnum, MovementTypeEnum } from 'src/modules/movement-modules/movements/entities/movement.entity';
import { MovementAnimalStatusEnum } from 'src/modules/movement-modules/movement-animals/entities/movement-animal.entity';
import { RanchAnimal } from 'src/modules/ranch-management/ranch-animals/entities/ranch-animal.entity';
import { EVENT_TYPE_IDS, PRODUCTIVE_STATUS_IDS, ANIMAL_STATUS_IDS } from 'src/shared/constants';
import { RanchRolesEnum } from 'src/shared/enums';
import { RanchSubscriptionsService } from 'src/modules/payment-modules/ranch-subscriptions/services/ranch-subscriptions.service';

const OWNER_ONLY_TYPES = [MovementTypeEnum.SALE, MovementTypeEnum.PURCHASE, MovementTypeEnum.RANCH_EXIT];

@Injectable()
export class RegisterMovementUseCase {
    constructor(
        private readonly dataSource: DataSource,
        private readonly movementsService: MovementsService,
        private readonly movementAnimalsService: MovementAnimalsService,
        private readonly animalEventsService: AnimalEventsService,
        private readonly ranchAnimalsService: RanchAnimalsService,
        private readonly ranchUsersService: RanchUsersService,
        private readonly treatmentsService: TreatmentsService,
        private readonly ranchSubscriptionsService: RanchSubscriptionsService,
    ) {}

    async execute(dto: RegisterMovementDto): Promise<MovementDto> {
        if (dto.localId) {
            const existing = await this.movementsService.findOneByLocalId(dto.localId);
            if (existing) return (await this.movementsService.findOneById(MovementDto, existing.id, { throwException: true }))!;
        }

        if (OWNER_ONLY_TYPES.includes(dto.movementType)) {
            await this.assertOwner(dto.idUser, dto.idRanch);
        }

        this.validateShape(dto);

        const loadedAnimals = await this.loadAndValidateAnimals(dto);

        if (dto.movementType === MovementTypeEnum.SALE) {
            await this.assertNoActiveWithdrawals(loadedAnimals);
        }

        if (dto.movementType === MovementTypeEnum.PURCHASE) {
            const currentActiveCount = await this.ranchAnimalsService.countActiveByRanch(dto.idRanch);
            await this.ranchSubscriptionsService.assertCapacityAvailable(dto.idRanch, currentActiveCount, dto.animals.length);
        }

        return await this.dataSource.transaction(async (manager) => {
            const movement = await this.movementsService.create(
                {
                    idRanch: dto.idRanch,
                    idUser: dto.idUser,
                    movementType: dto.movementType,
                    movementDate: dto.movementDate,
                    status: dto.movementType === MovementTypeEnum.SALE ? MovementStatusEnum.PENDING : MovementStatusEnum.CONFIRMED,
                    counterpartName: dto.counterpartName,
                    originName: dto.originName,
                    totalPrice: dto.totalPrice,
                    pricePerKg: dto.pricePerKg,
                    notes: dto.notes,
                    localId: dto.localId,
                    isSynced: dto.isSynced ?? false,
                },
                manager,
            );

            for (const animalDto of dto.animals) {
                switch (dto.movementType) {
                    case MovementTypeEnum.PASTURE_TRANSFER:
                        await this.processTransferAnimal(movement, animalDto, loadedAnimals, dto, manager);
                        break;
                    case MovementTypeEnum.SALE:
                        await this.processSaleAnimal(movement, animalDto, loadedAnimals, dto, manager);
                        break;
                    case MovementTypeEnum.RANCH_EXIT:
                        await this.processRanchExitAnimal(movement, animalDto, loadedAnimals, dto, manager);
                        break;
                    case MovementTypeEnum.PURCHASE:
                        await this.processPurchaseAnimal(movement, animalDto, dto, manager);
                        break;
                }
            }

            return (await this.movementsService.findOneById(MovementDto, movement.id, { throwException: true }, manager))!;
        });
    }

    private async assertOwner(idUser: number, idRanch: number): Promise<void> {
        const ranchUser = await this.ranchUsersService.findOne(idUser, idRanch);
        if (!ranchUser) {
            throw new ForbiddenException({ message: `User ID=${idUser} does not belong to ranch ID=${idRanch}.`, error: 'RANCH_ACCESS_DENIED' });
        }
        if (ranchUser.idRole !== RanchRolesEnum.OWNER) {
            throw new ForbiddenException({
                message: 'Only the ranch Owner can register sales, purchases and ranch exits (RN-01/RN-16).',
                error: 'ONLY_OWNER_ALLOWED',
            });
        }
    }

    private validateShape(dto: RegisterMovementDto): void {
        const type = dto.movementType;

        if (type === MovementTypeEnum.PURCHASE) {
            if (dto.animals.some((a) => !a.newAnimal)) {
                throw new BadRequestException({
                    message: 'In a purchase, every animal must include newAnimal with the data of the animal to create.',
                    error: 'PURCHASE_REQUIRES_NEW_ANIMAL',
                });
            }
        } else if (dto.animals.some((a) => !a.idRanchAnimal)) {
            throw new BadRequestException({
                message: `In a ${type} movement, every animal must include idRanchAnimal.`,
                error: 'ID_RANCH_ANIMAL_REQUIRED',
            });
        }

        if (type === MovementTypeEnum.PASTURE_TRANSFER && dto.animals.some((a) => !a.idLotDest)) {
            throw new BadRequestException({
                message: 'In a pasture_transfer, every animal must include idLotDest.',
                error: 'ID_LOT_DEST_REQUIRED',
            });
        }

        if (type === MovementTypeEnum.RANCH_EXIT && !dto.counterpartName) {
            throw new BadRequestException({
                message: 'In a ranch_exit, counterpartName (destination ranch) is required.',
                error: 'COUNTERPART_NAME_REQUIRED',
            });
        }
    }

    private async loadAndValidateAnimals(dto: RegisterMovementDto): Promise<Map<number, RanchAnimal>> {
        const loaded = new Map<number, RanchAnimal>();
        if (dto.movementType === MovementTypeEnum.PURCHASE) return loaded;

        const repo = this.dataSource.getRepository(RanchAnimal);
        for (const animalDto of dto.animals) {
            const id = animalDto.idRanchAnimal!;
            if (loaded.has(id)) {
                throw new BadRequestException({ message: `Animal ID=${id} appears more than once in the movement.`, error: 'DUPLICATED_ANIMAL_IN_MOVEMENT' });
            }
            const animal = await repo.findOne({ where: { id } });
            if (!animal) throw new BadRequestException({ message: `Animal ID=${id} does not exist.`, error: 'ANIMAL_NOT_FOUND' });
            if (Number(animal.idRanch) !== Number(dto.idRanch)) {
                throw new BadRequestException({ message: `Animal ID=${id} does not belong to ranch ID=${dto.idRanch}.`, error: 'ANIMAL_NOT_IN_RANCH' });
            }
            if (animal.idProductiveStatus === PRODUCTIVE_STATUS_IDS.BAJA) {
                throw new BadRequestException({
                    message: `Animal ID=${id} is discharged (ps=4) and cannot take part in a movement (RN-02/RN-07).`,
                    error: 'ANIMAL_IS_BAJA',
                });
            }
            if (animal.idStatus === ANIMAL_STATUS_IDS.PENDING_MOVEMENT) {
                throw new ConflictException({ message: `Animal ID=${id} is already included in another pending movement.`, error: 'ANIMAL_IN_PENDING_MOVEMENT' });
            }
            loaded.set(id, animal);
        }
        return loaded;
    }

    private async assertNoActiveWithdrawals(loadedAnimals: Map<number, RanchAnimal>): Promise<void> {
        for (const [id] of loadedAnimals) {
            const treatment = await this.treatmentsService.findActiveWithdrawal(id);
            if (treatment) {
                throw new ConflictException({
                    message: `Animal ID=${id} has an active sanitary withdrawal until ${treatment.withdrawalEndDate} and cannot be sold (RN-18).`,
                    error: 'ANIMAL_UNDER_WITHDRAWAL',
                });
            }
        }
    }

    private async processTransferAnimal(
        movement: Movement,
        animalDto: RegisterMovementAnimalDto,
        loadedAnimals: Map<number, RanchAnimal>,
        dto: RegisterMovementDto,
        manager: EntityManager,
    ): Promise<void> {
        const animal = loadedAnimals.get(animalDto.idRanchAnimal!)!;

        const event = await this.animalEventsService.create(
            {
                idRanchAnimal: animal.id,
                idEventType: EVENT_TYPE_IDS.TRANSFER,
                idUser: dto.idUser,
                notes: animalDto.notes,
                isSynced: dto.isSynced ?? false,
                eventDate: new Date(dto.movementDate),
            },
            manager,
        );

        await this.movementAnimalsService.create(
            {
                idMovement: movement.id,
                idRanchAnimal: animal.id,
                idLotOrigin: animal.idLot ?? undefined,
                idLotDest: animalDto.idLotDest,
                prevIdStatus: animal.idStatus,
                status: MovementAnimalStatusEnum.CONFIRMED,
                idEvent: event.id,
                notes: animalDto.notes,
                localId: animalDto.localId,
                isSynced: dto.isSynced ?? false,
            },
            manager,
        );

        await manager.getRepository(RanchAnimal).update({ id: animal.id }, { idLot: animalDto.idLotDest, updatedAt: new Date() });
    }

    private async processSaleAnimal(
        movement: Movement,
        animalDto: RegisterMovementAnimalDto,
        loadedAnimals: Map<number, RanchAnimal>,
        dto: RegisterMovementDto,
        manager: EntityManager,
    ): Promise<void> {
        const animal = loadedAnimals.get(animalDto.idRanchAnimal!)!;

        await this.movementAnimalsService.create(
            {
                idMovement: movement.id,
                idRanchAnimal: animal.id,
                idLotOrigin: animal.idLot ?? undefined,
                prevIdStatus: animal.idStatus,
                status: MovementAnimalStatusEnum.PENDING,
                notes: animalDto.notes,
                localId: animalDto.localId,
                isSynced: dto.isSynced ?? false,
            },
            manager,
        );

        await manager.getRepository(RanchAnimal).update({ id: animal.id }, { idStatus: ANIMAL_STATUS_IDS.PENDING_MOVEMENT, updatedAt: new Date() });
    }

    private async processRanchExitAnimal(
        movement: Movement,
        animalDto: RegisterMovementAnimalDto,
        loadedAnimals: Map<number, RanchAnimal>,
        dto: RegisterMovementDto,
        manager: EntityManager,
    ): Promise<void> {
        const animal = loadedAnimals.get(animalDto.idRanchAnimal!)!;

        const event = await this.animalEventsService.create(
            {
                idRanchAnimal: animal.id,
                idEventType: EVENT_TYPE_IDS.EXIT,
                idUser: dto.idUser,
                notes: animalDto.notes,
                isSynced: dto.isSynced ?? false,
                eventDate: new Date(dto.movementDate),
            },
            manager,
        );

        await this.movementAnimalsService.create(
            {
                idMovement: movement.id,
                idRanchAnimal: animal.id,
                idLotOrigin: animal.idLot ?? undefined,
                prevIdStatus: animal.idStatus,
                status: MovementAnimalStatusEnum.CONFIRMED,
                idEvent: event.id,
                notes: animalDto.notes,
                localId: animalDto.localId,
                isSynced: dto.isSynced ?? false,
            },
            manager,
        );

        await manager
            .getRepository(RanchAnimal)
            .update({ id: animal.id }, { idStatus: ANIMAL_STATUS_IDS.SOLD, idProductiveStatus: PRODUCTIVE_STATUS_IDS.BAJA, updatedAt: new Date() });
    }

    private async processPurchaseAnimal(
        movement: Movement,
        animalDto: RegisterMovementAnimalDto,
        dto: RegisterMovementDto,
        manager: EntityManager,
    ): Promise<void> {
        const data = animalDto.newAnimal!;
        const repo = manager.getRepository(RanchAnimal);

        const duplicated = await repo.findOne({ where: { code: data.code } });
        if (duplicated) {
            throw new ConflictException({ message: `An animal with code ${data.code} already exists (RN-03).`, error: 'DUPLICATED_ANIMAL_CODE' });
        }

        const newAnimal = repo.create();
        newAnimal.idRanch = dto.idRanch;
        newAnimal.idBreed = data.idBreed;
        newAnimal.idStatus = ANIMAL_STATUS_IDS.ACTIVE;
        newAnimal.idAnimalClass = data.idAnimalClass;
        newAnimal.code = data.code;
        newAnimal.sex = data.sex;
        newAnimal.birthdate = data.birthdate;
        newAnimal.origin = 'purchased';
        if (data.weight !== undefined) newAnimal.weight = data.weight;
        if (data.idLot !== undefined) newAnimal.idLot = data.idLot;
        if (data.idProductiveStatus !== undefined) newAnimal.idProductiveStatus = data.idProductiveStatus;
        const savedAnimal = await repo.save(newAnimal);

        const event = await this.animalEventsService.create(
            {
                idRanchAnimal: savedAnimal.id,
                idEventType: EVENT_TYPE_IDS.PURCHASE,
                idUser: dto.idUser,
                notes: animalDto.notes,
                isSynced: dto.isSynced ?? false,
                eventDate: new Date(dto.movementDate),
            },
            manager,
        );

        await this.movementAnimalsService.create(
            {
                idMovement: movement.id,
                idRanchAnimal: savedAnimal.id,
                idLotDest: data.idLot,
                prevIdStatus: ANIMAL_STATUS_IDS.ACTIVE,
                status: MovementAnimalStatusEnum.CONFIRMED,
                idEvent: event.id,
                notes: animalDto.notes,
                localId: animalDto.localId,
                isSynced: dto.isSynced ?? false,
            },
            manager,
        );
    }
}
