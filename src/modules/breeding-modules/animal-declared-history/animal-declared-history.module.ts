import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnimalDeclaredHistory } from './entities/animal-declared-history.entity';
import { AnimalDeclaredHistoryService } from './services/animal-declared-history.service';
import { AnimalDeclaredHistoryController } from './controllers/animal-declared-history.controller';
import { RanchAnimalsModule } from 'src/modules/ranch-management/ranch-animals/ranch-animals.module';
import { RanchUsersModule } from 'src/modules/ranch-management/ranch-users/ranch-users.module';

@Module({
    imports: [TypeOrmModule.forFeature([AnimalDeclaredHistory]), RanchAnimalsModule, RanchUsersModule],
    controllers: [AnimalDeclaredHistoryController],
    providers: [AnimalDeclaredHistoryService],
    exports: [AnimalDeclaredHistoryService],
})
export class AnimalDeclaredHistoryModule {}
