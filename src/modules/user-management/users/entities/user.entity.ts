import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseCreatedUpdated } from 'src/database/entities/base.entity';
import { Role } from 'src/modules/core/roles/entities/role.entity';
import { RanchUser } from 'src/modules/ranch-management/ranch-users/entities/ranch-user.entity';

// Tabla real: is_deleted es BOOLEAN, no una columna deleted_at — por eso extiende
// BaseCreatedUpdated (createdAt+updatedAt) en vez de BaseEntitySoftDelete, y el
// borrado lógico se maneja a mano en el service filtrando por isDeleted=false.
// Sin refresh_token — este proyecto usa un único access token, sin rotación.
@Entity('users')
export class User extends BaseCreatedUpdated {
    @PrimaryGeneratedColumn({ name: 'id_user' })
    id: number;

    @Column({ name: 'id_role', type: 'int' })
    roleId: number;

    @Column({ name: 'ci', type: 'varchar', length: 20 })
    ci: string;

    @Column({ name: 'fullname', type: 'varchar', length: 150 })
    fullname: string;

    @Column({ name: 'paternal_surname', type: 'varchar', length: 100 })
    paternalSurname: string;

    @Column({ name: 'maternal_surname', type: 'varchar', length: 100 })
    maternalSurname: string;

    @Column({ name: 'email', type: 'varchar', length: 150 })
    email: string;

    @Column({ name: 'password', type: 'varchar', length: 255 })
    password: string;

    @Column({ name: 'celphone', type: 'varchar', length: 20, nullable: true })
    celphone: string | null;

    // Código de "recuperar contraseña" vigente — hasheado (bcrypt, igual que password),
    // nunca en texto plano. NULL cuando no hay ninguno pendiente.
    @Column({ name: 'reset_code_hash', type: 'varchar', length: 255, nullable: true })
    resetCodeHash: string | null;

    @Column({ name: 'reset_code_expires_at', type: 'timestamp', nullable: true })
    resetCodeExpiresAt: Date | null;

    @Column({ name: 'is_deleted', type: 'boolean', default: false })
    isDeleted: boolean;

    @ManyToOne(() => Role, (role) => role.users, { nullable: false })
    @JoinColumn({ name: 'id_role' })
    role: Role;

    @OneToMany(() => RanchUser, (ranchUser) => ranchUser.user)
    ranchUsers: RanchUser[];
}
