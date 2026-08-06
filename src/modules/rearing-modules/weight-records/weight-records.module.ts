import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WeightRecord } from './entities/weight-record.entity';
import { WeightRecordsService } from './services/weight-records.service';
import { WeightRecordsController } from './controllers/weight-records.controller';
import { RanchAnimalsModule } from 'src/modules/ranch-management/ranch-animals/ranch-animals.module';
import { RanchLotsModule } from 'src/modules/ranch-management/ranch-lots/ranch-lots.module';
import { RanchUsersModule } from 'src/modules/ranch-management/ranch-users/ranch-users.module';

@Module({
    imports: [TypeOrmModule.forFeature([WeightRecord]), RanchAnimalsModule, RanchLotsModule, RanchUsersModule],
    controllers: [WeightRecordsController],
    providers: [WeightRecordsService],
    exports: [WeightRecordsService],
})
export class WeightRecordsModule {}
