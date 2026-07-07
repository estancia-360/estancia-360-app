import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { MovementAnimal, MovementAnimalStatusEnum } from '../entities/movement-animal.entity';
import { MovementAnimalNotFoundException } from '../exceptions/movement-animal-not-found.exception';

@Injectable()
export class MovementAnimalsService {
    constructor(
        @InjectRepository(MovementAnimal)
        private readonly movementAnimalsRepository: Repository<MovementAnimal>,
    ) {}

    async create(data: {
        idMovement: number;
        idRanchAnimal: number;
        idLotOrigin?: number;
        idLotDest?: number;
        prevIdStatus: number;
        status: MovementAnimalStatusEnum;
        idEvent?: number;
        notes?: string;
        localId?: string;
        isSynced?: boolean;
    }, manager?: EntityManager): Promise<MovementAnimal> {
        const repo = manager?.getRepository(MovementAnimal) ?? this.movementAnimalsRepository;
        const ma = new MovementAnimal();
        ma.idMovement = data.idMovement;
        ma.idRanchAnimal = data.idRanchAnimal;
        ma.idLotOrigin = data.idLotOrigin;
        ma.idLotDest = data.idLotDest;
        ma.prevIdStatus = data.prevIdStatus;
        ma.status = data.status;
        ma.idEvent = data.idEvent;
        ma.notes = data.notes;
        ma.localId = data.localId;
        ma.isSynced = data.isSynced ?? false;
        return await repo.save(ma);
    }

    async findEntityById(id: number, manager?: EntityManager): Promise<MovementAnimal | null> {
        const repo = manager?.getRepository(MovementAnimal) ?? this.movementAnimalsRepository;
        return await repo.findOne({ where: { id } }) ?? null;
    }

    async findEntityByIdOrFail(id: number, manager?: EntityManager): Promise<MovementAnimal> {
        const record = await this.findEntityById(id, manager);
        if (!record) throw new MovementAnimalNotFoundException(id);
        return record;
    }

    async findOneByLocalId(localId: string, manager?: EntityManager): Promise<MovementAnimal | null> {
        const repo = manager?.getRepository(MovementAnimal) ?? this.movementAnimalsRepository;
        return await repo.findOne({ where: { localId } }) ?? null;
    }

    async findByMovement(idMovement: number, manager?: EntityManager): Promise<MovementAnimal[]> {
        const repo = manager?.getRepository(MovementAnimal) ?? this.movementAnimalsRepository;
        return await repo.find({ where: { idMovement }, order: { id: 'ASC' } });
    }

    async update(id: number, data: {
        status?: MovementAnimalStatusEnum;
        idEvent?: number;
        notes?: string;
    }, manager?: EntityManager): Promise<void> {
        const repo = manager?.getRepository(MovementAnimal) ?? this.movementAnimalsRepository;
        await repo.update({ id }, { ...data, updatedAt: new Date() });
    }

    async countByMovementAndStatus(
        idMovement: number,
        status: MovementAnimalStatusEnum,
        manager?: EntityManager,
    ): Promise<number> {
        const repo = manager?.getRepository(MovementAnimal) ?? this.movementAnimalsRepository;
        return await repo.count({ where: { idMovement, status } });
    }
}
