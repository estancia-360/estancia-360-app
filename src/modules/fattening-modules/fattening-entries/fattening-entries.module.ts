import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FatteningEntry } from './entities/fattening-entry.entity';
import { FatteningEntriesService } from './services/fattening-entries.service';
import { FatteningEntriesController } from './controllers/fattening-entries.controller';
import { RanchAnimalsModule } from 'src/modules/ranch-management/ranch-animals/ranch-animals.module';
import { RanchUsersModule } from 'src/modules/ranch-management/ranch-users/ranch-users.module';

@Module({
    imports: [TypeOrmModule.forFeature([FatteningEntry]), RanchAnimalsModule, RanchUsersModule],
    controllers: [FatteningEntriesController],
    providers: [FatteningEntriesService],
    exports: [FatteningEntriesService],
})
export class FatteningEntriesModule {}
