import { BaseCreatedUpdated } from 'src/infrastructure/database/utils';
import { AnimalEvent } from 'src/modules/ranch-management/animal-events/entities/animal-event.entity';
import { RanchAnimal } from 'src/modules/ranch-management/ranch-animals/entities/ranch-animal.entity';
import { RanchLot } from 'src/modules/ranch-management/ranch-lots/entities/ranch-lot.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('weanings')
export class Weaning extends BaseCreatedUpdated {
    @PrimaryGeneratedColumn({
        name: 'id_weaning',
        type: 'bigint',
    })
    id: number;

    @Column({ name: 'local_id', type: 'varchar', length: 100, nullable: true, unique: true })
    localId?: string;

    @Column({ name: 'id_event', type: 'bigint', nullable: false })
    idEvent: number;

    @Column({ name: 'id_cria', type: 'bigint', nullable: false })
    idCria: number;

    @Column({ name: 'id_lot_dest', type: 'bigint', nullable: false })
    idLotDest: number;

    @Column({
        name: 'weaning_weight',
        type: 'decimal',
        precision: 10,
        scale: 2,
        nullable: true,
    })
    weaningWeight?: number;

    @Column({
        name: 'weaning_age',
        type: 'int',
        nullable: true,
    })
    weaningAge?: number;

    @ManyToOne(() => AnimalEvent)
    @JoinColumn({ name: 'id_event' })
    event?: AnimalEvent;

    @ManyToOne(() => RanchAnimal)
    @JoinColumn({ name: 'id_cria' })
    cria?: RanchAnimal;

    @ManyToOne(() => RanchLot)
    @JoinColumn({ name: 'id_lot_dest' })
    lotDest?: RanchLot;
}
