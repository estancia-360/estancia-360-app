import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseCreatedUpdated } from 'src/database/entities/base.entity';
import { AnimalEvent } from 'src/modules/ranch-management/animal-events/entities/animal-event.entity';
import { RanchAnimal } from 'src/modules/ranch-management/ranch-animals/entities/ranch-animal.entity';
import { RanchLot } from 'src/modules/ranch-management/ranch-lots/entities/ranch-lot.entity';

@Entity('weanings')
export class Weaning extends BaseCreatedUpdated {
    @PrimaryGeneratedColumn({ name: 'id_weaning', type: 'bigint' })
    id: number;

    @Column({ name: 'local_id', type: 'varchar', length: 100, nullable: true, unique: true })
    localId?: string;

    @Column({ name: 'id_event', type: 'bigint' })
    idEvent: number;

    @Column({ name: 'id_cria', type: 'bigint' })
    idCria: number;

    @Column({ name: 'id_lot_dest', type: 'bigint' })
    idLotDest: number;

    @Column({ name: 'weaning_weight', type: 'decimal', precision: 6, scale: 2, nullable: true })
    weaningWeight?: number;

    @Column({ name: 'weaning_age', type: 'int', nullable: true })
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
