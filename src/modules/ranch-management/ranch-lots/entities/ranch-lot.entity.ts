import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseCreatedUpdated } from 'src/database/entities/base.entity';
import { Ranch } from 'src/modules/ranch-management/ranches/entities/ranch.entity';
import { RanchPasture } from 'src/modules/ranch-management/ranch-pastures/entities/ranch-pasture.entity';
import { LotTypesEnum } from 'src/shared/enums';

@Entity('ranch_lots')
export class RanchLot extends BaseCreatedUpdated {
    @PrimaryGeneratedColumn({ name: 'id_lot', type: 'bigint' })
    id: number;

    @Column({ name: 'id_ranch', type: 'int' })
    idRanch: number;

    @Column({ name: 'id_ranch_pasture', type: 'bigint' })
    idRanchPasture: number;

    @Column({ name: 'name', type: 'varchar', length: 50 })
    name: string;

    @Column({ name: 'local_id', type: 'varchar', length: 100, nullable: true, unique: true })
    localId?: string;

    @Column({ name: 'lot_type', type: 'varchar', length: 30 })
    lotType: LotTypesEnum;

    @Column({ name: 'capacity', type: 'int', nullable: true })
    capacity: number | null;

    @Column({ name: 'is_active', type: 'boolean', default: true })
    isActive: boolean;

    @ManyToOne(() => Ranch, (ranch) => ranch.lots)
    @JoinColumn({ name: 'id_ranch' })
    ranch?: Ranch;

    @ManyToOne(() => RanchPasture)
    @JoinColumn({ name: 'id_ranch_pasture' })
    pasture?: RanchPasture;
}
