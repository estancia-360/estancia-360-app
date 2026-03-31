import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Ranch } from '../../ranches/entities/ranch.entity';
import { ProductionType } from 'src/modules/core/production-types/entities/production-type.entity';

@Entity('ranch_production_types')
export class RanchProductionType {

    @PrimaryColumn({ name: 'id_ranch', type: 'int' })
    idRanch: number;

    @PrimaryColumn({ name: 'id_production_type', type: 'int' })
    idProductionType: number;

    @ManyToOne(() => Ranch, (ranch) => ranch.productionTypes)
    @JoinColumn({ name: 'id_ranch' })
    ranch?: Ranch;

    @ManyToOne(() => ProductionType, (pt) => pt.ranchProductionTypes)
    @JoinColumn({ name: 'id_production_type' })
    productionType?: ProductionType;
}
