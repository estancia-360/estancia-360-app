import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WeightRecord } from './entities/weight-record.entity';
import { WeightRecordsService } from './services/weight-records.service';
import { WeightRecordsController } from './controllers/weight-records.controller';

@Module({
    imports: [TypeOrmModule.forFeature([WeightRecord])],
    controllers: [WeightRecordsController],
    providers: [WeightRecordsService],
    exports: [WeightRecordsService],
})
export class WeightRecordsModule {}
