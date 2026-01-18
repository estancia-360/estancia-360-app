import { Role } from "src/modules/core/roles/entities/role.entity";
import { hashPassword } from "src/shared/utils";
import { PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Entity, BeforeInsert, BeforeUpdate, JoinColumn, ManyToOne } from "typeorm";

@Entity('users')
export class User {
    @PrimaryGeneratedColumn({ name: 'id_user' })
    id: number;

    @Column({ name: 'id_role', type: 'int' })
    idRole: number;

    @Column({ name: 'ci', type: 'varchar', length: 20 })
    ci: string;

    @Column({ name: 'fullname', type: 'varchar', length: 150 })
    fullname: string;

    @Column({ name: 'paternal_surname', type: 'varchar', length: 100 })
    paternalSurname: string;

    @Column({ name: 'maternal_surname', type: 'varchar', length: 100, })
    maternalSurname?: string;

    @Column({ name: 'email', type: 'varchar', length: 150 })
    email: string;

    @Column({ name: 'password', type: 'varchar', length: 255 })
    password: string;

    @Column({
        name: 'celphone',
        type: 'varchar',
        length: 20,
        nullable: true,
    })
    celphone?: string;

    @Column({
        name: 'is_deleted',
        type: 'boolean',
        default: false,
    })
    isDeleted: boolean;

    @CreateDateColumn({
        name: 'created_at',
        type: 'timestamp',
    })
    createdAt: Date;

    @UpdateDateColumn({
        name: 'updated_at',
        type: 'timestamp',
    })
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
}