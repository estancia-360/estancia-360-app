import { Column, Entity, PrimaryColumn } from 'typeorm';
import { BaseEntityTurnable } from 'src/database/entities/base.entity';

@Entity('animal_classes')
export class AnimalClass extends BaseEntityTurnable {
    @PrimaryColumn({ name: 'id_animal_class', type: 'int' })
    id: number;

    @Column({ name: 'name', type: 'varchar', length: 100 })
    name: string;

    @Column({ name: 'sex', type: 'char', length: 1 })
    sex: 'F' | 'M';
}
