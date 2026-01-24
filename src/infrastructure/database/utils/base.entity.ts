import { CreateDateColumn, UpdateDateColumn, Column } from 'typeorm';

export abstract class BaseCreated {
    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;
}

export abstract class BaseCreatedUpdated extends BaseCreated {
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
