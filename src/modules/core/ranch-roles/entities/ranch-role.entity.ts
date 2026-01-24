import { BaseEntityTurnable } from 'src/infrastructure/database/utils';
import { RanchUser } from 'src/modules/ranch-management/ranch-users/entities/ranch-user.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('ranch_roles')
export class RanchRole extends BaseEntityTurnable {
    @PrimaryGeneratedColumn({ name: 'id_role' })
    id: number;

    @Column({
        name: 'name',
        type: 'varchar',
        length: 100,
    })
    name: string;

    @OneToMany(() => RanchUser,(ranchUser) => ranchUser.role)
    ranchUsers: RanchUser[]
}
