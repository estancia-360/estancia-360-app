import { User } from "src/modules/user-management/users/entities/user.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('roles')
export class Role {
    @PrimaryGeneratedColumn({ name: 'id_role' })
    id: number;

    @Column({ name: 'name', type: 'varchar', length: 100, nullable: false })
    name: string;

    @OneToMany(() => User, (user) => user.role)
    users: User[];
}
