import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Ranch } from 'src/modules/ranch-management/ranches/entities/ranch.entity';
import { ProductionType } from 'src/modules/core/production-types/entities/production-type.entity';

// Tabla de unión pura, sin service/controller propio — RanchesService la usa
// directo al crear una estancia.
@Entity('ranch_production_types')
export class RanchProductionType {
    @PrimaryColumn({ name: 'id_ranch', type: 'int' })
    idRanch: number;

    @PrimaryColumn({ name: 'id_production_type', type: 'int' })
    idProductionType: number;

    @ManyToOne(() => Ranch)
    @JoinColumn({ name: 'id_ranch' })
    ranch?: Ranch;

    @ManyToOne(() => ProductionType)
    @JoinColumn({ name: 'id_production_type' })
    productionType?: ProductionType;
}
