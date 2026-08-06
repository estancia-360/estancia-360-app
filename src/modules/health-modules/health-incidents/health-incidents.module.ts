import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthIncident } from './entities/health-incident.entity';
import { HealthIncidentsService } from './services/health-incidents.service';
import { HealthIncidentsController } from './controllers/health-incidents.controller';
import { RanchAnimalsModule } from 'src/modules/ranch-management/ranch-animals/ranch-animals.module';
import { RanchUsersModule } from 'src/modules/ranch-management/ranch-users/ranch-users.module';

@Module({
    imports: [TypeOrmModule.forFeature([HealthIncident]), RanchAnimalsModule, RanchUsersModule],
    controllers: [HealthIncidentsController],
    providers: [HealthIncidentsService],
    exports: [HealthIncidentsService],
})
export class HealthIncidentsModule {}
