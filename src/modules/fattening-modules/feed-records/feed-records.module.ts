import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedRecord } from './entities/feed-record.entity';
import { FeedRecordsService } from './services/feed-records.service';
import { FeedRecordsController } from './controllers/feed-records.controller';
import { RanchLotsModule } from 'src/modules/ranch-management/ranch-lots/ranch-lots.module';
import { RanchUsersModule } from 'src/modules/ranch-management/ranch-users/ranch-users.module';

@Module({
    imports: [TypeOrmModule.forFeature([FeedRecord]), RanchLotsModule, RanchUsersModule],
    controllers: [FeedRecordsController],
    providers: [FeedRecordsService],
    exports: [FeedRecordsService],
})
export class FeedRecordsModule {}
