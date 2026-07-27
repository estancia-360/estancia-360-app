import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthIncident } from './entities/health-incident.entity';
import { HealthIncidentsService } from './services/health-incidents.service';
import { HealthIncidentsController } from './controllers/health-incidents.controller';

@Module({
    imports: [TypeOrmModule.forFeature([HealthIncident])],
    controllers: [HealthIncidentsController],
    providers: [HealthIncidentsService],
    exports: [HealthIncidentsService],
})
export class HealthIncidentsModule {}
