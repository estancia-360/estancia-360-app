import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntityTurnable } from 'src/database/entities/base.entity';

// Rol del usuario DENTRO de una estancia (Owner/Worker/Administrator) — ver
// RanchRolesEnum en shared/enums para los IDs fijos que usa el código.
@Entity('ranch_roles')
export class RanchRole extends BaseEntityTurnable {
    @PrimaryGeneratedColumn({ name: 'id_role' })
    id: number;

    @Column({ name: 'name', type: 'varchar', length: 100 })
    name: string;
}
