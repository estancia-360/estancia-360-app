import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RanchRole } from './entities/ranch-role.entity';

// Solo registra la entity — nada la valida hoy (mismo comportamiento que el
// viejo: el id_role de ranch_users nunca se valida contra este catálogo,
// solo lo protege el FK de la DB). Sin service porque no hay lógica que exponer.
@Module({
    imports: [TypeOrmModule.forFeature([RanchRole])],
    exports: [TypeOrmModule],
})
export class RanchRolesModule {}
