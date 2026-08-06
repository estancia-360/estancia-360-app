import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BreedingService } from './entities/breeding-service.entity';
import { BreedingServicesService } from './services/breeding-services.service';
import { BreedingServicesController } from './controllers/breeding-services.controller';
import { RanchAnimalsModule } from 'src/modules/ranch-management/ranch-animals/ranch-animals.module';
import { RanchUsersModule } from 'src/modules/ranch-management/ranch-users/ranch-users.module';

@Module({
    imports: [TypeOrmModule.forFeature([BreedingService]), RanchAnimalsModule, RanchUsersModule],
    controllers: [BreedingServicesController],
    providers: [BreedingServicesService],
    exports: [BreedingServicesService],
})
export class BreedingServicesModule {}
