import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { RanchAnimal } from '../../ranch-animals/entities/ranch-animal.entity';

@Entity('animal_statuses')
export class AnimalStatus {
    @PrimaryGeneratedColumn({ name: 'id_status' })
    id: number;

    @Column({ name: 'name', type: 'varchar', length: 30 })
    name: string;

    @Column({ name: 'is_active', type: 'boolean', default: true })
    isActive: boolean;

    @OneToMany(() => RanchAnimal, (animal) => animal.status)
    animals?: RanchAnimal[];
}
