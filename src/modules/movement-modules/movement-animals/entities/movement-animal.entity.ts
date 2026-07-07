import { BaseCreatedUpdated } from 'src/infrastructure/database/utils';
import { AnimalEvent } from 'src/modules/ranch-management/animal-events/entities/animal-event.entity';
import { RanchAnimal } from 'src/modules/ranch-management/ranch-animals/entities/ranch-animal.entity';
import { RanchLot } from 'src/modules/ranch-management/ranch-lots/entities/ranch-lot.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Movement } from '../../movements/entities/movement.entity';

export enum MovementAnimalStatusEnum {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    REJECTED = 'rejected',
    CONFIRMED = 'confirmed',
}

@Entity('movement_animals')
export class MovementAnimal extends BaseCreatedUpdated {
    @PrimaryGeneratedColumn({ name: 'id_movement_animal', type: 'bigint' })
    id: number;

    @Column({ name: 'id_movement', type: 'bigint', nullable: false })
    idMovement: number;

    @Column({ name: 'id_ranch_animal', type: 'bigint', nullable: false })
    idRanchAnimal: number;

    @Column({ name: 'id_lot_origin', type: 'bigint', nullable: true })
    idLotOrigin?: number;

    @Column({ name: 'id_lot_dest', type: 'bigint', nullable: true })
    idLotDest?: number;

    @Column({ name: 'prev_id_status', type: 'int', nullable: false })
    prevIdStatus: number;

    @Column({ name: 'status', type: 'varchar', length: 30, default: MovementAnimalStatusEnum.PENDING })
    status: MovementAnimalStatusEnum;

    @Column({ name: 'id_event', type: 'bigint', nullable: true })
    idEvent?: number;

    @Column({ name: 'notes', type: 'text', nullable: true })
    notes?: string;

    @Column({ name: 'local_id', type: 'varchar', length: 100, nullable: true, unique: true })
    localId?: string;

    @Column({ name: 'is_synced', type: 'boolean', default: false })
    isSynced: boolean;

    @ManyToOne(() => Movement, (m) => m.animals)
    @JoinColumn({ name: 'id_movement' })
    movement?: Movement;

    @ManyToOne(() => RanchAnimal)
    @JoinColumn({ name: 'id_ranch_animal' })
    animal?: RanchAnimal;

    @ManyToOne(() => RanchLot)
    @JoinColumn({ name: 'id_lot_origin' })
    lotOrigin?: RanchLot;

    @ManyToOne(() => RanchLot)
    @JoinColumn({ name: 'id_lot_dest' })
    lotDest?: RanchLot;

    @ManyToOne(() => AnimalEvent)
    @JoinColumn({ name: 'id_event' })
    event?: AnimalEvent;
}
