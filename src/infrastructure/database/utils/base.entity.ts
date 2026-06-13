import { CreateDateColumn, UpdateDateColumn, Column } from 'typeorm';

export abstract class BaseCreated {
    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;
}

export abstract class BaseCreatedUpdated extends BaseCreated {
    /**
     * @UpdateDateColumn: TypeORM lo refresca automáticamente en cada repo.save()
     * (insert y update). Necesario para que el sync incremental (`updated_at > since`)
     * detecte ediciones sin requerir que cada servicio lo actualice manualmente.
     *
     * NOTA: repo.update()/queryBuilder().update() NO disparan este hook —
     * esos sitios deben setear updatedAt explícitamente (ver use-cases que
     * modifican ranch_animals fuera de save()).
     */
    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
    updatedAt: Date;
}

export abstract class BaseEntitySoftDelete extends BaseCreatedUpdated {
    @Column({ name: 'is_deleted', type: 'boolean', nullable: false, default: false })
    isDeleted: boolean;
}

export abstract class BaseEntityTurnable {
    @Column({
        name: 'is_active',
        type: 'boolean',
        default: true,
    })
    isActive: boolean;
}

export abstract class BaseEntityTurnableWithSoftDelete extends BaseEntitySoftDelete {
    @Column({
        name: 'is_active',
        type: 'boolean',
        default: true,
    })
    isActive: boolean;
}
