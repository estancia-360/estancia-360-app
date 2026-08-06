import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Treatment } from './entities/treatment.entity';
import { TreatmentsService } from './services/treatments.service';
import { TreatmentsController } from './controllers/treatments.controller';
import { RanchAnimalsModule } from 'src/modules/ranch-management/ranch-animals/ranch-animals.module';
import { RanchUsersModule } from 'src/modules/ranch-management/ranch-users/ranch-users.module';

@Module({
    imports: [TypeOrmModule.forFeature([Treatment]), RanchAnimalsModule, RanchUsersModule],
    controllers: [TreatmentsController],
    providers: [TreatmentsService],
    exports: [TreatmentsService],
})
export class TreatmentsModule {}
