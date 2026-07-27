import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseCreatedUpdated } from 'src/database/entities/base.entity';
import { Ranch } from 'src/modules/ranch-management/ranches/entities/ranch.entity';

@Entity('ranch_pastures')
export class RanchPasture extends BaseCreatedUpdated {
    @PrimaryGeneratedColumn({ name: 'id_ranch_pasture', type: 'bigint' })
    id: number;

    @Column({ name: 'id_ranch', type: 'int' })
    idRanch: number;

    @Column({ name: 'name', type: 'varchar', length: 50 })
    name: string;

    @Column({ name: 'local_id', type: 'varchar', length: 100, nullable: true, unique: true })
    localId?: string;

    @Column({ name: 'area_hectares', type: 'decimal', precision: 12, scale: 2 })
    areaHectares: number;

    @Column({ name: 'description', type: 'text', nullable: true })
    description?: string;

    @Column({ name: 'is_active', type: 'boolean', default: true })
    isActive: boolean;

    @ManyToOne(() => Ranch, (ranch) => ranch.pastures)
    @JoinColumn({ name: 'id_ranch' })
    ranch?: Ranch;
}
