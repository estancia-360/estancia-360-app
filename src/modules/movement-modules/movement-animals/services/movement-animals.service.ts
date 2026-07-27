import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { MovementAnimal, MovementAnimalStatusEnum } from '../entities/movement-animal.entity';
import { MovementAnimalNotFoundException } from '../exceptions';

@Injectable()
export class MovementAnimalsService {
    constructor(
        @InjectRepository(MovementAnimal)
        private readonly rawRepo: Repository<MovementAnimal>,
    ) {}

    async create(
        data: {
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
        },
        manager?: EntityManager,
    ): Promise<MovementAnimal> {
        const repo = manager?.getRepository(MovementAnimal) ?? this.rawRepo;
        const ma = repo.create();
        ma.idMovement = data.idMovement;
        ma.idRanchAnimal = data.idRanchAnimal;
        if (data.idLotOrigin !== undefined) ma.idLotOrigin = data.idLotOrigin;
        if (data.idLotDest !== undefined) ma.idLotDest = data.idLotDest;
        ma.prevIdStatus = data.prevIdStatus;
        ma.status = data.status;
        if (data.idEvent !== undefined) ma.idEvent = data.idEvent;
        if (data.notes !== undefined) ma.notes = data.notes;
        if (data.localId !== undefined) ma.localId = data.localId;
        ma.isSynced = data.isSynced ?? false;
        return await repo.save(ma);
    }

    async findEntityById(id: number, manager?: EntityManager): Promise<MovementAnimal | null> {
        const repo = manager?.getRepository(MovementAnimal) ?? this.rawRepo;
        return (await repo.findOne({ where: { id } })) ?? null;
    }

    async findEntityByIdOrFail(id: number, manager?: EntityManager): Promise<MovementAnimal> {
        const record = await this.findEntityById(id, manager);
        if (!record) throw new MovementAnimalNotFoundException(id);
        return record;
    }

    async findOneByLocalId(localId: string, manager?: EntityManager): Promise<MovementAnimal | null> {
        const repo = manager?.getRepository(MovementAnimal) ?? this.rawRepo;
        return (await repo.findOne({ where: { localId } })) ?? null;
    }

    async findByMovement(idMovement: number, manager?: EntityManager): Promise<MovementAnimal[]> {
        const repo = manager?.getRepository(MovementAnimal) ?? this.rawRepo;
        return await repo.find({ where: { idMovement }, order: { id: 'ASC' } });
    }

    async update(
        id: number,
        data: { status?: MovementAnimalStatusEnum; idEvent?: number; notes?: string },
        manager?: EntityManager,
    ): Promise<void> {
        const repo = manager?.getRepository(MovementAnimal) ?? this.rawRepo;
        await repo.update({ id }, { ...data, updatedAt: new Date() });
    }

    async countByMovementAndStatus(idMovement: number, status: MovementAnimalStatusEnum, manager?: EntityManager): Promise<number> {
        const repo = manager?.getRepository(MovementAnimal) ?? this.rawRepo;
        return await repo.count({ where: { idMovement, status } });
    }
}
