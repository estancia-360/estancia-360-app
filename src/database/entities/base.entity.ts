import { Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

/**
 * Progressive base classes for TypeORM entities. Choose the one that fits:
 *
 *   BaseCreated          → createdAt only
 *   BaseCreatedUpdated   → createdAt + updatedAt
 *   BaseEntitySoftDelete → createdAt + updatedAt + deletedAt (soft delete)
 *   BaseEntityTurnable   → isActive only, sin timestamps (catálogos semilla simples)
 */

export abstract class BaseCreated {
    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;
}

export abstract class BaseCreatedUpdated extends BaseCreated {
    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
    updatedAt: Date;
}

/**
 * Soft delete via @DeleteDateColumn.
 * TypeORM automatically appends WHERE deleted_at IS NULL to all finds.
 * Use repo.softDelete(id) / repo.restore(id) / repo.find({ withDeleted: true }).
 */
export abstract class BaseEntitySoftDelete extends BaseCreatedUpdated {
    @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
    deletedAt: Date | null;
}

/**
 * Catálogos semilla (countries, cities, production-types, ranch-roles, ...):
 * un simple toggle de habilitado/deshabilitado, sin columnas de auditoría.
 * No extiende BaseCreated — estas tablas reales no tienen created_at/updated_at.
 */
export abstract class BaseEntityTurnable {
    @Column({ name: 'is_active', type: 'boolean', default: true })
    isActive: boolean;
}
