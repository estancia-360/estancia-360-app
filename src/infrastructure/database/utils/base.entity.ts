import { CreateDateColumn, Column } from 'typeorm';

export abstract class BaseCreated {
    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;
}

export abstract class BaseCreatedUpdated extends BaseCreated {
    /**
     * TypeORM 0.3.x emite DEFAULT en el INSERT para @UpdateDateColumn cuando la
     * columna no tiene DEFAULT NOW() en la DB. Para garantizar que siempre se
     * envíe un valor explícito usamos inicialización de propiedad (= new Date()),
     * que TypeORM incluye directamente en el INSERT sin depender de hooks de
     * clases abstractas (cuya propagación es inconsistente entre versiones).
     *
     * Para UPDATE se debe actualizar updatedAt manualmente cuando corresponda
     * (ej: en el servicio antes de repo.save()), o aceptar que queda en la
     * fecha de creación (suficiente para el uso actual del proyecto).
     */
    @Column({ name: 'updated_at', type: 'timestamp', nullable: false })
    updatedAt: Date = new Date();
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
