import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';

@Entity('animal_classes')
export class AnimalClass {
    @PrimaryColumn({ name: 'id_animal_class', type: 'int' })
    id: number;

    @Column({ name: 'name', type: 'varchar', length: 100 })
    name: string;

    @Column({ name: 'sex', type: 'char', length: 1 })
    sex: 'F' | 'M';

    @Column({ name: 'is_active', type: 'boolean', default: true })
    isActive: boolean;
}
