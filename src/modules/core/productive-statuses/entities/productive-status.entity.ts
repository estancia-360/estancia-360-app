import { BaseEntityTurnable } from "src/infrastructure/database/utils";
import { RanchAnimal } from "src/modules/ranch-management/ranch-animals/entities/ranch-animal.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('productive_statuses')
export class ProductiveStatus extends BaseEntityTurnable {
    @PrimaryGeneratedColumn({ name: 'id_productive_status', type: 'int'})
    id: number

    @Column({ name: 'name', type: 'varchar', length: 50})
    name: string

    @OneToMany(() => RanchAnimal,(ra) => ra.productiveStatus)
    animals?: RanchAnimal[]
}
