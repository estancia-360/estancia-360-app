import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from 'src/modules/user-management/users/entities/user.entity';

// Tabla real sin columnas de auditoría (sin created_at/updated_at) — no extiende ningún Base*.
@Entity('roles')
export class Role {
    @PrimaryGeneratedColumn({ name: 'id_role' })
    id: number;

    @Column({ name: 'name', type: 'varchar', length: 100 })
    name: string;

    @OneToMany(() => User, (user) => user.role)
    users: User[];
}
