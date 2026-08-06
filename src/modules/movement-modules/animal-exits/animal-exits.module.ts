import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnimalExit } from './entities/animal-exit.entity';
import { AnimalExitsService } from './services/animal-exits.service';
import { AnimalExitsController } from './controllers/animal-exits.controller';
import { RanchAnimalsModule } from 'src/modules/ranch-management/ranch-animals/ranch-animals.module';
import { RanchUsersModule } from 'src/modules/ranch-management/ranch-users/ranch-users.module';

@Module({
    imports: [TypeOrmModule.forFeature([AnimalExit]), RanchAnimalsModule, RanchUsersModule],
    controllers: [AnimalExitsController],
    providers: [AnimalExitsService],
    exports: [AnimalExitsService],
})
export class AnimalExitsModule {}
