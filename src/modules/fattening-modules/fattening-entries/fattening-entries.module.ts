import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FatteningEntry } from './entities/fattening-entry.entity';
import { FatteningEntriesService } from './services/fattening-entries.service';

@Module({
    imports: [TypeOrmModule.forFeature([FatteningEntry])],
    providers: [FatteningEntriesService],
    exports: [FatteningEntriesService],
})
export class FatteningEntriesModule {}
