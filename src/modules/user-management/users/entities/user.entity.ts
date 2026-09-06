import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseCreatedUpdated } from 'src/database/entities/base.entity';
import { Role } from 'src/modules/core/roles/entities/role.entity';
import { RanchUser } from 'src/modules/ranch-management/ranch-users/entities/ranch-user.entity';

// Tabla real: is_deleted es BOOLEAN, no una columna deleted_at — por eso extiende
// BaseCreatedUpdated (createdAt+updatedAt) en vez de BaseEntitySoftDelete, y el
// borrado lógico se maneja a mano en el service filtrando por isDeleted=false.
// Sin refresh_token — este proyecto usa un único access token, sin rotación.
//
// BUG-10 (auditoria QA E2E, 2026-09-03): ci/email solo se validaban como unicos a nivel
// aplicacion (existsBy({..., isDeleted:false}) en users.service.create) — una condicion de
// carrera (dos registros simultaneos) podia colar dos usuarios activos con el mismo ci/email.
// Los indices unicos son PARCIALES (solo sobre isDeleted=false) a proposito, para no romper el
// flujo ya existente de reusar el email/ci de una cuenta previamente borrada logicamente.
@Entity('users')
@Index('UQ_users_email_active', ['email'], { unique: true, where: '"is_deleted" = false' })
@Index('UQ_users_ci_active', ['ci'], { unique: true, where: '"is_deleted" = false' })
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
