import { Expose } from "class-transformer";
import { Role } from "src/modules/core/roles/entities/role.entity";
import { RanchUser } from "src/modules/ranch-management/ranch-users/entities/ranch-user.entity";
import { Ranch } from "src/modules/ranch-management/ranches/entities/ranch.entity";
import { hashPassword } from "src/shared/utils";
import { PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Entity, BeforeInsert, BeforeUpdate, JoinColumn, ManyToOne, OneToMany, ManyToMany, JoinTable } from "typeorm";

@Entity('users')
export class User {
    @PrimaryGeneratedColumn({ name: 'id_user' })
    @Expose()
    id: number;

    @Column({ name: 'id_role', type: 'int' })
    @Expose()
    idRole: number;

    @Column({ name: 'ci', type: 'varchar', length: 20 })
    @Expose()
    ci: string;

    @Column({ name: 'fullname', type: 'varchar', length: 150 })
    @Expose()
    fullname: string;

    @Column({ name: 'paternal_surname', type: 'varchar', length: 100 })
    @Expose()
    paternalSurname: string;

    @Column({ name: 'maternal_surname', type: 'varchar', length: 100, })
    @Expose()
    maternalSurname?: string;

    @Column({ name: 'email', type: 'varchar', length: 150 })
    @Expose()
    email: string;

    @Column({ name: 'password', type: 'varchar', length: 255 })
    @Expose()
    password: string;

    @Column({
        name: 'celphone',
        type: 'varchar',
        length: 20,
        nullable: true,
    })
    @Expose()
    celphone?: string;

    @Column({
        name: 'is_deleted',
        type: 'boolean',
        default: false,
    })
    @Expose()
    isDeleted: boolean;

    @CreateDateColumn({
        name: 'created_at',
        type: 'timestamp',
    })
    @Expose()
    createdAt: Date;

    @UpdateDateColumn({
        name: 'updated_at',
        type: 'timestamp',
    })
    @Expose()
    updatedAt: Date;

    @ManyToOne(() => Role, (role) => role.users, { nullable: false })
	@JoinColumn({ name: 'id_role' })
	role: Role;

    @BeforeInsert()
    @BeforeUpdate()
    async passwordOperation() {
        if (this.password) {
            this.password = await hashPassword(this.password);
        }
    }

    @OneToMany(() => RanchUser,(ranchUser) => ranchUser.user)
    ranchUsers: RanchUser[]

    @ManyToMany(() => Ranch,(ranch) => ranch.users)
    @JoinTable({
        name: 'ranch_users',
        joinColumn: { name: 'id_user' },
        inverseJoinColumn: { name: 'id_ranch' }
    })
    ranches: Ranch[]
}