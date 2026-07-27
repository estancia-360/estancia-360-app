import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedRecord } from './entities/feed-record.entity';
import { FeedRecordsService } from './services/feed-records.service';
import { FeedRecordsController } from './controllers/feed-records.controller';

@Module({
    imports: [TypeOrmModule.forFeature([FeedRecord])],
    controllers: [FeedRecordsController],
    providers: [FeedRecordsService],
    exports: [FeedRecordsService],
})
export class FeedRecordsModule {}
