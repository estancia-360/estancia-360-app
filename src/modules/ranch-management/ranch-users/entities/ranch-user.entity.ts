import { RanchRole } from "src/modules/core/ranch-roles/entities/ranch-role.entity";
import { User } from "src/modules/user-management/users/entities/user.entity";
import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Ranch } from "../../ranches/entities/ranch.entity";
import { BaseEntitySoftDelete } from "src/infrastructure/database/utils";

@Entity('ranch_users')
export class RanchUser extends BaseEntitySoftDelete {
    @PrimaryColumn({ name: 'id_user', type: 'int' })
    idUser: number;

    @PrimaryColumn({ name: 'id_ranch', type: 'int' })
    idRanch: number;

    @Column({ name: 'id_role', type: 'int' })
    idRole: number;

    @Column({
        name: 'salary',
        type: 'decimal',
        precision: 12,
        scale: 2,
        nullable: true,
    })
    salary?: number;

    @ManyToOne(() => User,(user) => user.ranchUsers)
    @JoinColumn({ name: 'id_user' })
    user: User;

    @ManyToOne(() => Ranch, (ranch) => ranch.ranchUsers)
    @JoinColumn({ name: 'id_ranch' })
    ranch: Ranch;

    @ManyToOne(() => RanchRole, (ranchRole) => ranchRole.ranchUsers)
    @JoinColumn({ name: 'id_role' })
    role: RanchRole;
}