import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseCreatedUpdated } from 'src/database/entities/base.entity';
import { User } from 'src/modules/user-management/users/entities/user.entity';
import { Ranch } from 'src/modules/ranch-management/ranches/entities/ranch.entity';
import { RanchRole } from 'src/modules/core/ranch-roles/entities/ranch-role.entity';

// Tabla real: is_deleted es BOOLEAN, no deleted_at — mismo caso que User,
// por eso extiende BaseCreatedUpdated y no BaseEntitySoftDelete (esa usa
// @DeleteDateColumn, que asume una columna deleted_at que acá no existe).
@Entity('ranch_users')
export class RanchUser extends BaseCreatedUpdated {
    @PrimaryColumn({ name: 'id_user', type: 'int' })
    idUser: number;

    @PrimaryColumn({ name: 'id_ranch', type: 'int' })
    idRanch: number;

    @Column({ name: 'id_role', type: 'int' })
    idRole: number;

    @Column({ name: 'is_deleted', type: 'boolean', default: false })
    isDeleted: boolean;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'id_user' })
    user: User;

    @ManyToOne(() => Ranch)
    @JoinColumn({ name: 'id_ranch' })
    ranch: Ranch;

    @ManyToOne(() => RanchRole)
    @JoinColumn({ name: 'id_role' })
    role: RanchRole;
}
