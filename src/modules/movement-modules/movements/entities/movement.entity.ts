import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseCreatedUpdated } from 'src/database/entities/base.entity';
import { Ranch } from 'src/modules/ranch-management/ranches/entities/ranch.entity';
import { User } from 'src/modules/user-management/users/entities/user.entity';
import { MovementAnimal } from 'src/modules/movement-modules/movement-animals/entities/movement-animal.entity';

export enum MovementTypeEnum {
    SALE = 'sale',
    PURCHASE = 'purchase',
    PASTURE_TRANSFER = 'pasture_transfer',
    RANCH_EXIT = 'ranch_exit',
}

export enum MovementStatusEnum {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    CANCELLED = 'cancelled',
}

@Entity('movements')
export class Movement extends BaseCreatedUpdated {
    @PrimaryGeneratedColumn({ name: 'id_movement', type: 'bigint' })
    id: number;

    @Column({ name: 'id_ranch', type: 'bigint' })
    idRanch: number;

    @Column({ name: 'id_user', type: 'bigint', nullable: true })
    idUser?: number;

    @Column({ name: 'movement_type', type: 'varchar', length: 30 })
    movementType: MovementTypeEnum;

    @Column({ name: 'movement_date', type: 'date' })
    movementDate: Date;

    @Column({ name: 'status', type: 'varchar', length: 30, default: MovementStatusEnum.PENDING })
    status: MovementStatusEnum;

    @Column({ name: 'counterpart_name', type: 'varchar', length: 200, nullable: true })
    counterpartName?: string;

    @Column({ name: 'origin_name', type: 'varchar', length: 200, nullable: true })
    originName?: string;

    @Column({ name: 'total_price', type: 'decimal', precision: 12, scale: 2, nullable: true })
    totalPrice?: number;

    @Column({ name: 'price_per_kg', type: 'decimal', precision: 8, scale: 2, nullable: true })
    pricePerKg?: number;

    @Column({ name: 'notes', type: 'text', nullable: true })
    notes?: string;

    @Column({ name: 'local_id', type: 'varchar', length: 100, nullable: true, unique: true })
    localId?: string;

    @Column({ name: 'is_synced', type: 'boolean', default: false })
    isSynced: boolean;

    @ManyToOne(() => Ranch)
    @JoinColumn({ name: 'id_ranch' })
    ranch?: Ranch;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'id_user' })
    user?: User;

    @OneToMany(() => MovementAnimal, (ma) => ma.movement)
    animals?: MovementAnimal[];
}
