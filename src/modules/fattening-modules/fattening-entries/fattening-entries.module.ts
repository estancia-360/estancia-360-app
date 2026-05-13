import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FatteningEntry } from './entities/fattening-entry.entity';
import { FatteningEntriesService } from './services/fattening-entries.service';
import { FatteningEntriesController } from './controllers/fattening-entries.controller';

@Module({
    imports: [TypeOrmModule.forFeature([FatteningEntry])],
    controllers: [FatteningEntriesController],
    providers: [FatteningEntriesService],
    exports: [FatteningEntriesService],
})
export class FatteningEntriesModule {}
