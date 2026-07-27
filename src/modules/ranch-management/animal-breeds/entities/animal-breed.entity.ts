import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('animal_breeds')
export class AnimalBreed {
    @PrimaryGeneratedColumn({ name: 'id_breed' })
    id: number;

    @Column({ name: 'name', type: 'varchar', length: 30 })
    name: string;

    @Column({ name: 'is_active', type: 'boolean', default: true })
    isActive: boolean;
}
