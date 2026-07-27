import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SyncDeletion } from './entities/sync-deletion.entity';
import { SyncDeletionsService } from './services/sync-deletions.service';

@Module({
    imports: [TypeOrmModule.forFeature([SyncDeletion])],
    providers: [SyncDeletionsService],
    exports: [SyncDeletionsService],
})
export class SyncDeletionsModule {}
